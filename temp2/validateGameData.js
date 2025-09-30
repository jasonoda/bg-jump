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
  // check score
  // ---------------------------------------------------------------------------------------------

  console.log("=== VALIDATION SCORE CHECK DEBUG ===");
  console.log("Final game data score:", finalGameData.score);
  console.log("Breadcrumbs array:", breadcrumbs);

  this.scoreCheck = 0;

  for(var i=0; i<breadcrumbs.length; i++){

    var b = breadcrumbs[i]
    console.log("Breadcrumb", i, ":", b);
    if(b.levelScore!==undefined){
         console.log("Adding level score", b.levelScore, "to total");
         this.scoreCheck+=b.levelScore;
    }
   
  }

  console.log("Sum of level scores:", this.scoreCheck);
  console.log("Final game data score:", finalGameData.score);
  console.log("Score match:", this.scoreCheck === finalGameData.score);

  if(this.scoreCheck!==finalGameData.score){
    
    reasons.push("SCORE DID NOT ADD UP "+this.scoreCheck+" / "+finalGameData.score);
    isValid=false;

  }
  console.log("=====================================");
  
  // ---------------------------------------------------------------------------------------------
  // check match points vs level scores
  // ---------------------------------------------------------------------------------------------

  for(var i=0; i<breadcrumbs.length; i++){

    var b = breadcrumbs[i]
    if(b.levelMatchPoints!==undefined && b.levelScore!==undefined){
      
      var matchPointsTotal = 0;
      for(var j=0; j<b.levelMatchPoints.length; j++){
        matchPointsTotal += b.levelMatchPoints[j];
      }
      
      if(matchPointsTotal !== b.levelScore){
        reasons.push("LEVEL MATCH POINTS DID NOT ADD UP "+matchPointsTotal+" / "+b.levelScore+" for level "+(i+1));
        isValid=false;
      }
      
    }
   
  }
  
  // ---------------------------------------------------------------------------------------------
  // check game scores
  // ---------------------------------------------------------------------------------------------

  console.log("=== VALIDATION GAME SCORES CHECK DEBUG ===");
  console.log("Game scores array length:", finalGameData.gameScores.length);
  console.log("Game scores array:", finalGameData.gameScores);

  this.scoreCheck = 0;

  for(var i=0; i<finalGameData.gameScores.length; i++){

    var b = finalGameData.gameScores[i]
    console.log("Game score", i, ":", b);
    if(b!==undefined){
         console.log("Adding game score", b, "to total");
         this.scoreCheck+=b;
    }

  }

  console.log("Sum of game scores:", this.scoreCheck);
  console.log("Final game data score:", finalGameData.score);
  console.log("Game scores match:", this.scoreCheck === finalGameData.score);

  if(this.scoreCheck!==finalGameData.score){
    
    reasons.push("GAME SCORES DID NOT ADD UP "+this.scoreCheck+" / "+finalGameData.score);
    isValid=false;

  }
  console.log("==========================================");
  
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
`;