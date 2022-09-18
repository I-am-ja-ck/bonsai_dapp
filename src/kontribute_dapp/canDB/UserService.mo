import CA "mo:candb/CanisterActions";
import CanDB "mo:candb/CanDB";
import Entity "mo:candb/Entity";
import Types "./Types";
import Principal "mo:base/Principal";
import Nat "mo:base/Nat";

shared ({ caller = owner }) actor class UserService({
    partitionKey: Text;
    scalingOptions: CanDB.ScalingOptions;
    owners: ?[Principal];
}) {

    stable let db = CanDB.init({
        pk = partitionKey;
        scalingOptions = scalingOptions;
    });

    stable var _storyId = 0;

    public query func getPK(): async Text { db.pk };

    public query func skExists(sk: Text): async Bool { 
        CanDB.skExists(db, sk);
    };

    public shared({ caller = caller }) func transferCycles(): async () {
        if (caller == owner) {
            return await CA.transferCycles(caller);
        };
    };

    public shared({caller}) func putStory(story: Types.Story): async () {
        assert(checkStory(story) == true);
        assert(Principal.toText(caller) == partitionKey);

        _storyId := _storyId + 1;

        await CanDB.put(db, {
            sk = Nat.toText(_storyId);
            attributes = [
                ("storyTitle", #text(story.title)),
                ("storyBody", #text(story.body))
            ]
        })
    };

    public query func getStory(id: Text): async ?Types.Story {
        let story = switch(CanDB.get(db, { sk = id })) {
            case null { null };
            case (?userEntity) { unwrapUser(userEntity) };
        };

        switch(story) {
            case null { null };
            case (?{ storyTitle; storyBody }) {
                ?({
                    title: storyTitle;
                    body: storyBody
                });
            }
        }
    };

    private func checkStory(story: Types.Story): Bool {
        if(story.title == "" or story.body == ""){
            return false
        };
        // add checks here that likes & votes are 0
        return true
    };

      // attempts to cast an Entity (retrieved from CanDB) into a User type
    private func unwrapUser(entity: Entity.Entity): ?Types.Story {
        let { sk; attributes } = entity;
        let storyTitle = Entity.getAttributeMapValueForKey(attributes, "storyTitle");
        let storyBody = Entity.getAttributeMapValueForKey(attributes, "storyBody");

        switch(storyTitle, storyBody) {
            case (
                ?(#text(storyTitle)),
                ?(#text(storyBody))
            ) { ?{ storyTitle; storyBody } };
            case _ { 
                null 
            }
        };
    };
}