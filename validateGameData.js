/**
 * This function should return an object that looks like this:
 *
 * {
 *   isValid: true | false,
 *   reasons: [] // an array of strings
 * }
 *
 * @param initialGameData This is the same data structure passed to the iFrame using the window.CG_API.InitGame message
 * @param breadcrumbs This is an array of breadcrumb objects received from the game using the window.GC_API.BreadCrumb message
 * @param finalGameData This is the final score object sent from the game using the window.GC_API.FinalScores message
 */

const validateGameDataCode = 
`
function validateGameData(initialGameData, breadcrumbs, finalGameData) {

  // add final breadcrumb

  breadcrumbs.push(finalGameData.metadata.breadcrumb);

  console.log("validate game data");
  
  var isValid = true;
  var reasons = [];

  console.log("---------------------------------------");

  for(var i=0; i<breadcrumbs.length; i++){

    console.log(i);
    console.log(breadcrumbs[i]);

  }

  console.log("---------------------------------------");

  console.log(finalGameData);

  console.log("---------------------------------------");

  // ---------------------------------------------------------------------------------------------
  // check for breadcrumb for every level (prevent level skipping cheats)
  // ---------------------------------------------------------------------------------------------

  console.log("=== LEVEL SKIP CHECK ===");
  // Get the final level reached from the last breadcrumb
  var finalLevel = breadcrumbs[breadcrumbs.length - 1].currentLevel || 0;
  console.log("Final level reached:", finalLevel);
  
  // Track which levels have breadcrumbs
  var levelsWithBreadcrumbs = {};
  for(var i = 0; i < breadcrumbs.length; i++){
    if(breadcrumbs[i].currentLevel !== undefined){
      levelsWithBreadcrumbs[breadcrumbs[i].currentLevel] = true;
    }
  }
  console.log("Levels with breadcrumbs:", Object.keys(levelsWithBreadcrumbs).join(', '));
  
  // Check that every level from 2 to finalLevel has a breadcrumb
  // (Level 1 doesn't need a breadcrumb since game starts at level 1)
  for(var level = 2; level <= finalLevel; level++){
    if(!levelsWithBreadcrumbs[level]){
      console.log("❌ MISSING breadcrumb for level " + level);
      reasons.push("MISSING BREADCRUMB FOR LEVEL " + level + " - possible level skip cheat");
      isValid = false;
    }
  }
  console.log(isValid ? "✅ All levels have breadcrumbs" : "❌ Level skip detected");
  console.log("========================");
 
  // ---------------------------------------------------------------------------------------------
  // check coin/pellet count (prevent coin duplication cheats)
  // ---------------------------------------------------------------------------------------------

  console.log("=== COIN COUNT CHECK ===");
  // Game has 3 pellets per level for 30 levels = 90 total pellets maximum
  var MAX_PELLETS = 90;
  var finalPelletCount = breadcrumbs[breadcrumbs.length - 1].pelletCount || 0;
  console.log("Coins collected:", finalPelletCount, "/ Max:", MAX_PELLETS);
  
  if(finalPelletCount > MAX_PELLETS){
    console.log("❌ TOO MANY COINS - possible duplication cheat");
    reasons.push("TOO MANY COINS COLLECTED " + finalPelletCount + " / " + MAX_PELLETS + " - possible coin duplication cheat");
    isValid = false;
  } else {
    console.log("✅ Coin count is valid");
  }
  console.log("========================");

  // ---------------------------------------------------------------------------------------------
  // check final score calculation (height + coins)
  // ---------------------------------------------------------------------------------------------

  console.log("=== SCORE CALCULATION CHECK ===");
  // Get values from the last breadcrumb (which is the final breadcrumb)
  var finalHeightScore = breadcrumbs[breadcrumbs.length - 1].heightScore || 0;
  var finalCoinScore = finalPelletCount * 25; // Each coin is worth 25 points
  var calculatedFinalScore = finalHeightScore + finalCoinScore;
  var reportedFinalScore = finalGameData.score || 0;
  
  console.log("Height score:", finalHeightScore);
  console.log("Coin score:", finalCoinScore, "(", finalPelletCount, "coins × 25)");
  console.log("Calculated total:", calculatedFinalScore);
  console.log("Reported total:", reportedFinalScore);
  
  if(calculatedFinalScore !== reportedFinalScore){
    console.log("❌ SCORE MISMATCH - calculated vs reported don't match");
    reasons.push("SCORE MISMATCH - Calculated: " + calculatedFinalScore + " (height: " + finalHeightScore + " + coins: " + finalCoinScore + ") but reported: " + reportedFinalScore);
    isValid = false;
  } else {
    console.log("✅ Score calculation is valid");
  }
  console.log("================================");

  // ---------------------------------------------------------------------------------------------
  // check if extra breadcrumbs were added
  // ---------------------------------------------------------------------------------------------

  if( breadcrumbs.length > finalGameData.level){

    reasons.push("TOO MANY BREADCRUMBS "+breadcrumbs.length+" / "+finalGameData.level);
    isValid=false;

  }
  
  // ---------------------------------------------------------------------------------------------
  // end
  // ---------------------------------------------------------------------------------------------

  console.log("---------------------------------------");

  console.log(isValid);

  for(var i=0; i<reasons.length; i++){

    console.log( reasons[i] );

  }

  console.log("---------------------------------------");

  var status = {
    isValid: isValid,
    reasons: reasons
  }

  return status

}
`