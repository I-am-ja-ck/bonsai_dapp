import Cycles "mo:base/ExperimentalCycles";
import Debug "mo:base/Debug";
import Error "mo:base/Error";
import Principal "mo:base/Principal";
import Text "mo:base/Text";

import CA "mo:candb/CanisterActions";
import CanisterMap "mo:candb/CanisterMap";
import Buffer "mo:stable-buffer/StableBuffer";
import UserService "./UserService";

shared ({caller = owner}) actor class IndexCanister() = this {
  /// @required stable variable (Do not delete or change)
  ///
  /// Holds the CanisterMap of PK -> CanisterIdList
  stable var pkToCanisterMap = CanisterMap.init();

  /// @required API (Do not delete or change)
  ///
  /// Get all canisters for an specific PK
  ///
  /// This method is called often by the candb-client query & update methods. 
  public shared query({caller = caller}) func getCanistersByPK(pk: Text): async [Text] {
    getCanisterIdsIfExists(pk);
  };

  /// @required function (Do not delete or change)
  ///
  /// Helper method acting as an interface for returning an empty array if no canisters
  /// exist for the given PK
  func getCanisterIdsIfExists(pk: Text): [Text] {
    switch(CanisterMap.get(pkToCanisterMap, pk)) {
      case null { [] };
      case (?canisterIdsBuffer) { Buffer.toArray(canisterIdsBuffer) } 
    }
  };

  /// @modify and @required (Do not delete or change the API, but must change/modify the function logic for your given application actor and data model)
  ///
  /// This is method is called by CanDB for AutoScaling. It is up to the developer to specify which
  /// PK prefixes should spin up which canister actor.
  ///
  /// If the developer does not utilize this method, auto-scaling will NOT work
  public shared({caller = caller}) func createAdditionalCanisterForPK(pk: Text): async Text {
    await createUserServiceCanister(pk, ?[owner, Principal.fromActor(this)])
  };

  // Partition HelloService canisters by the region passed in
  public shared({caller = creator}) func createUserServiceCanisterByPrincipal(principal: Text): async ?Text {
    let pk = principal;
    let canisterIds = getCanisterIdsIfExists(pk);
    if (canisterIds == []) {
      ?(await createUserServiceCanister(pk, ?[owner, Principal.fromActor(this)]));
    // already exists
    } else {
      Debug.print(pk # " already exists, not creating and returning null");
      null 
    };
  };

  // Spins up a new HelloService canister with the provided pk and controllers
  func createUserServiceCanister(pk: Text, controllers: ?[Principal]): async Text {
    Debug.print("creating new user service canister with pk=" # pk);
    // Pre-load 300 billion cycles for the creation of a new Hello Service canister
    // Note that canister creation costs 100 billion cycles, meaning there are 200 billion
    // left over for the new canister when it is created
    Cycles.add(300_000_000_000);
    let newUserServiceCanister = await UserService.UserService({
      partitionKey = pk;
      scalingOptions = {
        autoScalingCanisterId = Principal.toText(Principal.fromActor(this));
        sizeLimit = #heapSize(200_000_000); // Scale out at 200MB
      };
      owners = controllers;
    });
    let newUserServiceCanisterPrincipal = Principal.fromActor(newUserServiceCanister);
    await CA.updateCanisterSettings({
      canisterId = newUserServiceCanisterPrincipal;
      settings = {
        controllers = controllers;
        compute_allocation = ?0;
        memory_allocation = ?0;
        freezing_threshold = ?2592000;
      }
    });

    let newUserServiceCanisterId = Principal.toText(newUserServiceCanisterPrincipal);
    // After creating the new Hello Service canister, add it to the pkToCanisterMap
    pkToCanisterMap := CanisterMap.add(pkToCanisterMap, pk, newUserServiceCanisterId);

    Debug.print("new user service canisterId=" # newUserServiceCanisterId);
    newUserServiceCanisterId;
  }
}