import CA "mo:candb/CanisterActions";
import CanDB "mo:candb/CanDB";
import Entity "mo:candb/Entity";
import Types "./Types";
import Principal "mo:base/Principal";
import Nat "mo:base/Nat";
import Option "mo:base/Option";
import Result "mo:base/Result";
import Array "mo:base/Array";

shared ({ caller = owner }) actor class StoryService({
    partitionKey : Text;
    scalingOptions : CanDB.ScalingOptions;
    owners : ?[Principal];
}) {

    stable let db = CanDB.init({
        pk = partitionKey;
        scalingOptions = scalingOptions;
    });

    public shared ({ caller }) func whoami() : async Principal {
        return caller;
    };

    public query func getPK() : async Text { db.pk };

    public query func skExists(sk : Text) : async Bool {
        CanDB.skExists(db, sk);
    };

    public shared ({ caller = caller }) func transferCycles() : async () {
        if (caller == owner) {
            return await CA.transferCycles(caller);
        };
    };

    public shared ({ caller }) func putStory(singleStory : Types.SingleStory, proposals : [Types.VotingProposal]) : async Text {
        assert (checkStory(singleStory) == true);

        let storySortKey = "author#" # Principal.toText(caller) # "#groupedStory#" # singleStory.groupName # "#singleStory#" # singleStory.title;

        await CanDB.put(
            db,
            {
                sk = storySortKey;
                attributes = [
                    ("groupName", #text(singleStory.groupName)),
                    ("title", #text(singleStory.title)),
                    ("body", #text(singleStory.body)),
                    ("likes", #int(0)),
                    ("views", #int(0)),
                    ("author", #text(Principal.toText(caller))),
                    ("proposals", #int(singleStory.proposals)), // pass in the proposals array length/amount
                ];
            },
        );

        // if there is proposals(checked from story input -> passed from frontend) we add them, otherwise proposals is an empty object in an array
        if (singleStory.proposals > 0) {
            var proposalsAmount = 1;

            for (p in proposals.vals()) {
                await CanDB.put(
                    db,
                    {
                        sk = "proposal#" # Nat.toText(proposalsAmount) # "for#" # storySortKey;
                        attributes = [
                            ("proposalNumber", #int(proposalsAmount)), // passed into the voteOnProposal function
                            ("title", #text(p.title)),
                            ("body", #text(p.body)),
                            ("votes", #int(0)),
                        ];
                    },
                );

                proposalsAmount += 1;
            };
        };

        return storySortKey;
    };

    /* 
    Story API:
    */

    public shared ({ caller }) func likeStory(storySK : Text) : async Result.Result<?Types.ConsumableEntity, Text> {
        // candb get sk = caller # storyID, attribute, liked: true or false
        let sortKeyForLikes = "user#" # Principal.toText(caller) # "liked#" # storySK;

        // get a stories previous likes total
        let story = switch (CanDB.get(db, { sk = storySK })) {
            case null { null };
            case (?storyEntity) { unwrapStory(storyEntity) };
        };

        let likesResult = switch (story) {
            case null { null };
            case (?{ likes }) {
                ?({
                    likes;
                });
            };
        };

        let newLikes = Option.get(likesResult, { likes = 0 }).likes + 1;

        let updatedLikeAttribute = [("likes", #int(newLikes))];

        func updateAttributes(attributeMap : ?Entity.AttributeMap) : Entity.AttributeMap {
            switch (attributeMap) {
                case null {
                    Entity.createAttributeMapFromKVPairs(updatedLikeAttribute);
                };
                case (?map) {
                    Entity.updateAttributeMapWithKVPairs(map, updatedLikeAttribute);
                };
            };
        };

        // check if user has liked by searching the sk
        let likedStory = switch (CanDB.get(db, { sk = sortKeyForLikes })) {
            case null {

                // we update the story likes
                let updated = switch (
                    CanDB.update(
                        db,
                        {
                            pk = "StoryService";
                            sk = storySK;
                            updateAttributeMapFunction = updateAttributes;
                        },
                    ),
                ) {
                    case null { null };
                    case (?entity) {
                        ?{
                            pk = entity.pk;
                            sk = entity.sk;
                            attributes = Entity.extractKVPairsFromAttributeMap(entity.attributes);
                        };
                    };
                };

                // user has liked we store user like
                await CanDB.put(
                    db,
                    {
                        sk = sortKeyForLikes;
                        attributes = [("liked", #bool(true))];
                    },
                );

                return #ok(updated);
            };
            case (?userEntity) {
                return #err("User already liked");
            };
        };

    };

    public query func getStory(storySK : Text) : async ?Types.SingleStory {
        let story = switch (CanDB.get(db, { sk = storySK })) {
            case null { null };
            case (?userEntity) { unwrapStory(userEntity) };
        };

        switch (story) {
            case null { null };
            case (?{ groupName; title; body; likes; views; author; proposals }) {
                ?({
                    groupName;
                    title;
                    body;
                    likes;
                    views;
                    author;
                    proposals;
                });
            };
        };
    };

    public query func scanAllStories(skLowerBound : Text, skUpperBound : Text, limit : Nat, ascending : ?Bool) : async Types.ScanStoriesResult {

        let { entities; nextKey } = CanDB.scan(
            db,
            {
                skLowerBound = skLowerBound;
                skUpperBound = skUpperBound;
                limit = limit;
                ascending = ascending;
            },
        );

        {
            stories = unwrapValidStories(entities);
            nextKey = nextKey;
        }

    };

    /* 
    Vote API:
    */

    public query func getProposal(proposalSK : Text) : async ?Types.VotingProposal {
        let proposal = switch (CanDB.get(db, { sk = proposalSK })) {
            case null { null };
            case (?userEntity) { unwrapProposal(userEntity) };
        };

        switch (proposal) {
            case null { null };
            case (?{ title; body; votes; proposalNumber }) {
                ?({
                    title;
                    body;
                    votes;
                    proposalNumber;
                });
            };
        };
    };

    public shared ({ caller }) func voteOnProposal(proposalNumber : Text, storySK : Text) : async Result.Result<?Types.ConsumableEntity, Text> {
        let sortKeyForVotes = "user#" # Principal.toText(caller) # "votedOn#" # storySK; // to ensure 1 user gets 1 vote per story
        let sortKeyForProposal = "proposal#" # proposalNumber # "for#" # storySK; // general proposal sort key so we can update specefic proposals

        // get a votes previous likes
        let proposal = switch (CanDB.get(db, { sk = sortKeyForProposal })) {
            case null { null };
            case (?proposalEntity) { unwrapProposal(proposalEntity) };
        };

        let proposalResult = switch (proposal) {
            case null { null };
            case (?{ votes }) {
                ?({
                    votes;
                });
            };
        };

        let newVote = Option.get(proposalResult, { votes = 0 }).votes + 1;

        let updatedVoteAttribute = [("votes", #int(newVote))];

        func updateAttributes(attributeMap : ?Entity.AttributeMap) : Entity.AttributeMap {
            switch (attributeMap) {
                case null {
                    Entity.createAttributeMapFromKVPairs(updatedVoteAttribute);
                };
                case (?map) {
                    Entity.updateAttributeMapWithKVPairs(map, updatedVoteAttribute);
                };
            };
        };

        let votedProposal = switch (CanDB.get(db, { sk = sortKeyForVotes })) {
            case null {
                // user hasnt voted

                // we update the proposal votes
                let updated = switch (
                    CanDB.update(
                        db,
                        {
                            pk = "StoryService";
                            sk = sortKeyForProposal;
                            updateAttributeMapFunction = updateAttributes;
                        },
                    ),
                ) {
                    case null { null };
                    case (?entity) {
                        ?{
                            pk = entity.pk;
                            sk = entity.sk;
                            attributes = Entity.extractKVPairsFromAttributeMap(entity.attributes);
                        };
                    };
                };

                // user has voted we store user vote
                await CanDB.put(
                    db,
                    {
                        sk = sortKeyForVotes;
                        attributes = [("voted", #bool(true))];
                    },
                );

                return #ok(updated)
            };
            case(?userEntity){
                return #err("user has already voted")
            }
        };
    };

    /* 
    Utility API:
    */

    private func checkStory(story : Types.SingleStory) : Bool {
        if (story.title == "" or story.body == "") {
            return false;
        };
        return true;
    };

    private func unwrapProposal(entity : Entity.Entity) : ?Types.VotingProposal {
        let { sk; attributes } = entity;

        let proposalTitleValue = Entity.getAttributeMapValueForKey(attributes, "title");
        let proposalBodyValue = Entity.getAttributeMapValueForKey(attributes, "body");
        let proposalVotesValue = Entity.getAttributeMapValueForKey(attributes, "votes");
        let proposalNumberValue = Entity.getAttributeMapValueForKey(attributes, "proposal#");

        switch (proposalTitleValue, proposalBodyValue, proposalVotesValue, proposalNumberValue) {
            case (
                ?(#text(title)),
                ?(#text(body)),
                ?(#int(votes)),
                ?(#int(proposalNumber)),
            ) { ?{ title; body; votes; proposalNumber } };
            case _ {
                null;
            };
        };
    };

    private func unwrapStory(entity : Entity.Entity) : ?Types.SingleStory {
        let { sk; attributes } = entity;

        let storyGroupNameValue = Entity.getAttributeMapValueForKey(attributes, "groupName");
        let storyTitleValue = Entity.getAttributeMapValueForKey(attributes, "title");
        let storyBodyValue = Entity.getAttributeMapValueForKey(attributes, "body");
        let storyLikesValue = Entity.getAttributeMapValueForKey(attributes, "likes");
        let storyViewsValue = Entity.getAttributeMapValueForKey(attributes, "views");
        let storyAuthorValue = Entity.getAttributeMapValueForKey(attributes, "author");
        let storyProposalsValue = Entity.getAttributeMapValueForKey(attributes, "proposals");

        switch (storyGroupNameValue, storyTitleValue, storyBodyValue, storyLikesValue, storyViewsValue, storyAuthorValue, storyProposalsValue) {
            case (
                ?(#text(groupName)),
                ?(#text(title)),
                ?(#text(body)),
                ?(#int(likes)),
                ?(#int(views)),
                ?(#text(author)),
                ?(#int(proposals)),
            ) { ?{ groupName; title; body; likes; views; author; proposals } };
            case _ {
                null;
            };
        };
    };

    // unwrap stories from array returned from scan function
    private func unwrapValidStories(entities : [Entity.Entity]) : [Types.SingleStory] {
        Array.mapFilter<Entity.Entity, Types.SingleStory>(
            entities,
            func(e) {
                let { sk; attributes } = e;
                let storyGroupNameValue = Entity.getAttributeMapValueForKey(attributes, "groupName");
                let storyTitleValue = Entity.getAttributeMapValueForKey(attributes, "title");
                let storyBodyValue = Entity.getAttributeMapValueForKey(attributes, "body");
                let storyLikesValue = Entity.getAttributeMapValueForKey(attributes, "likes");
                let storyViewsValue = Entity.getAttributeMapValueForKey(attributes, "views");
                let storyAuthorValue = Entity.getAttributeMapValueForKey(attributes, "author");
                let storyProposalsValue = Entity.getAttributeMapValueForKey(attributes, "proposals");

                switch (storyGroupNameValue, storyTitleValue, storyBodyValue, storyLikesValue, storyViewsValue, storyAuthorValue, storyProposalsValue) {
                    case (
                        ?(#text(groupName)),
                        ?(#text(title)),
                        ?(#text(body)),
                        ?(#int(likes)),
                        ?(#int(views)),
                        ?(#text(author)),
                        ?(#int(proposals)),
                    ) {
                        ?{
                            groupName;
                            title;
                            body;
                            likes;
                            views;
                            author;
                            proposals;
                        };
                    };
                    case _ {
                        null;
                    };
                };
            },
        );
    };

};
