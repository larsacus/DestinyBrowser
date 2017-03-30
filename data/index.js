
var descriptions = {};

descriptions.hashKeys = {
  bundleHash: "DestinyActivityBundleDefinition", // [activityBundleHashes]
  activityHash: "DestinyActivityDefinition", // [activityHashes]
  activityTypeHash: "DestinyActivityTypeDefinition",
  classHash: "DestinyClassDefinition",                   
  combatantHash: "DestinyCombatantDefinition",                   
  damageTypeHash: "DestinyDamageTypeDefinition",            
  destinationHash: "DestinyDestinationDefinition",
  directorBookHash: "DestinyDirectorBookDefinition",  //bookHash (internally)
  enemyRaceHash: "DestinyEnemyRaceDefinition",             
  factionHash: "DestinyFactionDefinition",                       
  genderHash: "DestinyGenderDefinition",                   
  tierHash: "DestinyMedalTierDefinition", // Unknown if correct hash key
  bucketHash: "DestinyInventoryBucketDefinition",     
  bucketTypeHash: "DestinyInventoryBucketDefinition",     
  itemHash: "DestinyInventoryItemDefinition",               
  itemCategoryHash: "DestinyItemCategoryDefinition", // [itemCategoryHashes]
  locationHash: "DestinyLocationDefinition",
  objectiveHash: "DestinyObjectiveDefinition",
  placeHash: "DestinyPlaceDefinition",
  progressionHash: "DestinyProgressionDefinition",
  raceHash: "DestinyRaceDefinition",
  recordHash: "DestinyRecordDefinition",
  rewardSourceHash: "DestinyRewardSourceDefinition", // [sourceHashes]
  sourceHash: "DestinyVendorDefinition", // [sourceHashes]
  perkHash: "DestinySandboxPerkDefinition",
  skullHash: "DestinyScriptedSkullDefinition",
  eventHash: "DestinySpecialEventDefinition",
  statHash: "DestinyStatDefinition",
  // primaryBaseStatHash: "DestinyStatGroupDefinition",
  statGroupHash: "DestinyStatGroupDefinition",
  talentGridHash: "DestinyTalentGridDefinition",
  triumphSetHash: "DestinyTriumphSetDefinition",
  flagHash: "DestinyUnlockFlagDefinition", // unlockFlagHash
  categoryHash: "DestinyVendorCategoryDefinition",
  vendorHash: "DestinyVendorDefinition",
};

// : "DestinyActivityCategoryDefinition", // What is "parentHashes"?
// : "DestinyActivityModeDefinition",  
// : "DestinyBondDefinition", 
// : "DestinyGrimoireCardDefinition",            
// : "DestinyGrimoireDefinition",                
// : "DestinyHistoricalStatsDefinition", // pretty sure only usable with user data
// : "DestinyRecordBookDefinition",


// Unknown:
//   questItemHashes
//   nodeDefinitionHash -- from DestinyDirectorBookDefinition.nodes
//   styleHash -- from DestinyDirectorBookDefinition.nodes
//   flagHash -- DestinyDirectorBookDefinition.isVisibleExpression.steps
//   bucketTypeHash -- DestinyInventoryItemDefinition
//   primaryBaseStatHash -- DestinyInventoryItemDefinition
//   perkHashes -- DestinyInventoryItemDefinition
//   channelHash -- DestinyInventoryItemDefinition.equippingBlock.defaultDyes
//   dyeHash -- DestinyInventoryItemDefinition.equippingBlock.defaultDyes
//   flagHash -- DestinyInventoryItemDefinition.customDyeExpression.steps
//   valueHash -- DestinyInventoryItemDefinition.customDyeExpression.steps
//   weaponPatternHash -- DestinyInventoryItemDefinition
//   equipmentSlotHash -- DestinyInventoryItemDefinition
//   rewardItemHash -- DestinyInventoryItemDefinition
//   setItemHashes -- DestinyInventoryItemDefinition
//   questlineItemHash -- DestinyInventoryItemDefinition
//   uniquenessHash -- DestinyInventoryItemDefinition
//   activityGraphHash -- DestinyLocationDefinition
//   activityGraphNodeHash -- DestinyLocationDefinition
//   unlockValueHash -- DestinyObjectiveDefinition
//   bountyHashes -- DestinySpecialEventDefinition
//   questHashes -- DestinySpecialEventDefinition

// Some IDs don't match the id column in the database -- these are outdated or deprecated objects

descriptions.tableDescriptions = [
  {
    hashName: "bundleHash",
    tableName: "DestinyActivityBundleDefinition",
    description: 'Groups of activities. Everything from crucible play types, strikes, and quests. Differs from simple "activities" in that these group multiple activities together.',
  }, // [activityBundleHashes]
  {
    hashName: "activityHash",
    tableName: "DestinyActivityDefinition",
    description: "Specific activity definitions including quests, strikes, raids, and crucible activities.",
  }, // [activityHashes]
  {
    hashName: "activityTypeHash",
     tableName: "DestinyActivityTypeDefinition",
     description: "Generic game classifications, including Story, Crucible, Raid, Trials, etc.",
  },
  {
    hashName: "classHash",
     tableName: "DestinyClassDefinition",
     description: "Guardian class definitions.",
  },                   
  {
    hashName: "combatantHash",
     tableName: "DestinyCombatantDefinition",
     description: "Enemy class definitions.",
  },                   
  {
    hashName: "damageTypeHash",
     tableName: "DestinyDamageTypeDefinition",
     description: "Weapon damage type (burn) definitions.",
  },            
  {
    hashName: "destinationHash",
     tableName: "DestinyDestinationDefinition",
     description: "Generic destinations such as Ocean of Storms -- Moon, Venus, Meridian Bay, The Crucible, etc.",
  },
  {
    hashName: "directorBookHash",
    tableName: "DestinyDirectorBookDefinition",
    description: "This appears to be an internal repreasentation of how to construct the Director in-game.",
    },  //bookHash (internally)
 
  {
    hashName: "enemyRaceHash",
     tableName: "DestinyEnemyRaceDefinition",
     description: "Enemy race definitions. Includes PvP guardian combatant type.",
  },             
  {
    hashName: "factionHash",
     tableName: "DestinyFactionDefinition",
     description: "All faction definitions. This also includes crucible \"vs.\" game types Alpha/Bravo teams.",
  },                       
  {
    hashName: "genderHash",
     tableName: "DestinyGenderDefinition",
     description: "Guardian gender definitions.",
  },                   
  {
    hashName: "tierHash",
    tableName: "DestinyMedalTierDefinition",
    description: "Unknown. Somehow related to crucible medals.",
    }, // Unknown if correct hash key
 
  {
    hashName: "bucketHash",
     tableName: "DestinyInventoryBucketDefinition",
     description: "Inventory bucket definitions. Used in the API to determine where items live and where they are allowed to be transferred. Includes buckets like Bounties, Lost Items, and Special Orders.",
  },     
  {
    hashName: "bucketTypeHash",
     tableName: "DestinyInventoryBucketDefinition",
     description: "Simliar to bucketHash in content. These definitions are grouped more generically into overarching types.",
  },     
  {
    hashName: "itemHash",
     tableName: "DestinyInventoryItemDefinition",
     description: "Item definitions for every item in the game. Items include weapons, gear, bounties, ships, and quest steps.",
  },               
  {
    hashName: "itemCategoryHash",
    tableName: "DestinyItemCategoryDefinition",
    description: "Grouping definitions for item categories. This includes gear class type (Titan-only, etc) categories.",
    }, // [itemCategoryHashes]
 
  {
    hashName: "locationHash",
     tableName: "DestinyLocationDefinition",
     description: "Definitions for specific locations within destinations. e.g. Brother Vance, Shaxx, or Patrol - Plaguelands.",
  },
  {
    hashName: "objectiveHash",
     tableName: "DestinyObjectiveDefinition",
     description: "Definitions for all objectives in the game. This includes patrol activities and specific quest requirements.",
  },
  {
    hashName: "placeHash",
     tableName: "DestinyPlaceDefinition",
     description: "Generic geographical definitions. Differs from destinations in that Place is more generic.",
  },
  {
    hashName: "progressionHash",
     tableName: "DestinyProgressionDefinition",
     description: "Definitions for tracking progress against. e.g. Guardian class progression, weapon leveling, iron banner bounties, etc.",
  },
  {
    hashName: "raceHash",
     tableName: "DestinyRaceDefinition",
     description: "Guardian race definitions.",
  },
  {
    hashName: "recordHash",
     tableName: "DestinyRecordDefinition",
     description: "Definitions for specific record-keeping in record book progression.",
  },
  {
    hashName: "rewardSourceHash",
    tableName: "DestinyRewardSourceDefinition",
    description: "Definitions for the source of loot. Can include characters, activities, or events.",
    }, // [sourceHashes]
  {
    hashName: "sourceHash",
    tableName: "DestinyVendorDefinition",
    description: "Definitions for vendor, vendor rewards, or event rewards.",
    }, // [sourceHashes]
 
  {
    hashName: "perkHash",
     tableName: "DestinySandboxPerkDefinition",
     description: "Definitions for individual perks.",
  },
  {
    hashName: "skullHash",
     tableName: "DestinyScriptedSkullDefinition",
     description: "Definitions for activity gameplay modifiers such as Trickle & Solar Burn.",
  },
  {
    hashName: "eventHash",
     tableName: "DestinySpecialEventDefinition",
     description: "Definitions for active special events.",
  },
  {
    hashName: "statHash",
     tableName: "DestinyStatDefinition",
     description: "Definitions for individual weapon/guardian stats such as Equip Speed, Aim Assist, Intellect, etc.",
  },
  /* {
    hashName: "primaryBaseStatHash",
     tableName: "DestinyStatGroupDefinition",
     description: "",
  },*/
  {
    hashName: "statGroupHash",
     tableName: "DestinyStatGroupDefinition",
     description: "Definitions for stat groups with no user-facing strings. Likely used to render specific gear stat graphs to the user for gear that references these groups.",
  },
  {
    hashName: "talentGridHash",
     tableName: "DestinyTalentGridDefinition",
     description: "Talent grid definitions define groups of possible perks and their relationship for a given piece of gear.",
  },
  {
    hashName: "triumphSetHash",
     tableName: "DestinyTriumphSetDefinition",
     description: "Definitions for Year of Triumph for Year 1. Since only contains year 1, they likely rolled subsequent years into the record book format.",
  },
  {
    hashName: "flagHash",
    tableName: "DestinyUnlockFlagDefinition",
    description: "Definitions for various unlock requirements in the game. Most are generic and probably only relevent to an internal developer, but some indicate requirements such as \"Queen's Wrath Rank 3\" or \"12 wins on a single Trials Passage\".",
  }, // unlockFlagHash
  {
    hashName: "categoryHash",
     tableName: "DestinyVendorCategoryDefinition",
     description: "Vendor category definitions such as Xûr, Eververse, Iron Temple, Tower, etc.",
  },
  {
    hashName: "vendorHash",
     tableName: "DestinyVendorDefinition",
     description: "Definitions for vendor-related items such as vendors themselves or the rewards they provide.",
  }
];

descriptions.tableForHashType = function (hashType) {
  return this.hashKeys[hashType];
}

module.exports = descriptions;
