//This script creates a chain of "CC Simple Wire Removal" Effects along a Created MaskPath
//You can define the Thickness for a Spline
//Everytime you change the position of your spline, you have to recreate the effect



{
function SplineWire(thisObj)
{
//Globals
//todo better inits
var scriptName = "Stringstream";
var EffectName = "CC Simple Wire Removal";
activeComp =0;
mask = 0;
maskPath = 0;
numOfKeys = -1;
compFrameRate = -1;
wireThickness = -1;
myMasks = -1;
numOfMasks = -1;
var masksContainer = new Array();
//======================================================
//==================== UI CALL BACKS ===================
//======================================================
function onFontStringChanged()
{
	fontSizePX = parseInt(pt2px(this.text));
}

function onFindStringChanged()
{
	myFindString = this.text;
}

// Called when the Replacement Text string is edited
function onReplaceStringChanged()
{
	myReplaceString = this.text;
}

//======================================================
//================ MAIN ENTRY FUNCTION =================
//======================================================
function onCreate()
{

compFrameRate = activeComp.frameRate;
activeComp = app.project.activeItem; 

myMasks = activeComp.layer(1).Masks;
numOfMasks = myMasks.numProperties;


getAllMasks();


addWireRemovalEffect();
setEffectValues();

}

function getAllMasks(){
	for(i = 1; i <= numOfMasks; i++){
		tempMask = activeComp.layer(1).mask(i);
		masksContainer.push(tempMask);
	}
}

function addWireRemovalEffect(){
removeAllWireEffects();

for(k = 0; k <= numOfMasks-1; k++){
	for (j = 0 ; j <  masksContainer[k].maskPath.value.vertices.length-1; j++){
		var wireEffect =  activeComp.layer(1).property("Effects").addProperty("CC Simple Wire Removal");

		var maskGroupID = "m" + k;
		wireEffect.name =  maskGroupID + " CC Simple Wire Removal " + j;
	}
}
//Create a Slider for the thickness
//var slider  = activeComp.layer(1).property("Effects").addProperty("Slider Control");
//slider.property(1).setValue(12);


}

function onUpdateThickness(id, thickness){
myEffects = activeComp.layer(1).Effects;
 compareString = "m" + id + " " + EffectName;
 for (j = myEffects.numProperties; j > 0; j--){
	if(myEffects.property(j).name.substring(0, 25).localeCompare(compareString) == 0){
        myEffects.property(j).property("Thickness").setValue(thickness);
    }
      }


}

function removeAllWireEffects(){
 try{
      myEffects = activeComp.layer(1).Effects;
	      for(id= 1; id <= numOfMasks; id++){
	      	compareString = "m" + id + " " + EffectName;
		      for (j = myEffects.numProperties; j > 0; j--){
		      	if(myEffects.property(j).name.substring(0, 25).localeCompare(compareString) == 0){
		        myEffects.property(j).remove();
		    	}
	      }
      }
    }catch(err){
    }

}


function setEffectValues(){

myEffects = activeComp.layer(1).Effects;


for(k = 0; k <= numOfMasks-1; k++){
//Iterate through the Frame Keys
	for(j = 1; j <= masksContainer[k].maskPath.numKeys; j++){

		actualKeyTime = masksContainer[k].maskPath.keyTime(j);

		var pathKeyValue = getValueAtTime(actualKeyTime, k);
		
		iterator = masksContainer[k].maskPath.value.vertices.length-1;
		for(i = 0; i < iterator; i++){
			propname = "m" + (k) + " CC Simple Wire Removal " + i;
				
				var pointA = [pathKeyValue.vertices[i][0], pathKeyValue.vertices[i][1]];
				var pointB = [pathKeyValue.vertices[i+1][0], pathKeyValue.vertices[i+1][1]];
				
				activeComp.layer(1).property("Effects").property(propname).property("Point A").addKey(actualKeyTime);
				activeComp.layer(1).property("Effects").property(propname).property("Point A").setValueAtTime(actualKeyTime, pointA);
				activeComp.layer(1).property("Effects").property(propname).property("Point B").addKey(actualKeyTime);
				activeComp.layer(1).property("Effects").property(propname).property("Point B").setValueAtTime(actualKeyTime, pointB);
				activeComp.layer(1).property("Effects").property(propname).property("Thickness").setValue(10);
			
			
		}
	}
}
}


function getValueAtTime(timeOfKey, k){
	return  masksContainer[k].maskPath.valueAtTime(timeOfKey, true);
}


//================================================================
//========================= GUI CREATION =========================
//================================================================
	if (parseFloat(app.version) < 8)
		{
			alert("This script requires After Effects CS3 or later.", scriptName);
			return;
		}
		else
		{
			// Create and show a floating palette
			var my_palette = (thisObj instanceof Panel) ? thisObj : new Window("palette", scriptName, undefined, {resizeable:true});
			if (my_palette != null)
			{
				var res = 
				"group { \
					orientation:'column', alignment:['fill','fill'], alignChildren:['left','top'], spacing:5, margins:[0,0,0,0], \
					findRow: Group { \
						alignment:['fill','top'], \
						selectTxtButton: Button { text:'Video Layer', alignment:['fill','left'] }, \
						fontString: StaticText { text:'Thickness:', alignment:['right','left'] }, \
						mask1: EditText { text:'2', characters:3, alignment:['fill','center'] }, \
						mask2: EditText { text:'2', characters:3, alignment:['fill','center'] }, \
						mask3: EditText { text:'2', characters:3, alignment:['fill','center'] }, \
						mask4: EditText { text:'2', characters:3, alignment:['fill','center'] }, \
					}, \
					m1: Group { \
						alignment:['fill','top'],\
						mask5: EditText { text:'2', characters:3, alignment:['fill','center'] }, \
					},\
					replaceRow: Group { \
						alignment:['fill','top'], \
						replaceEditText: EditText { text:'', characters:4, alignment:['fill','center'] }, \
					}, \
					cmds: Group { \
						alignment:['fill','top'], \
						createButton: Button { text:'Create', alignment:['fill','center'] }, \
						helpButton: Button { text:'?', alignment:['right','center'], preferredSize:[25,20] }, \
					}, \
				}";
				
				my_palette.margins = [10,10,10,10];
				my_palette.grp = my_palette.add(res);
				
				// Workaround to ensure the editext text color is black, even at darker UI brightness levels
				var winGfx = my_palette.graphics;
				var darkColorBrush = winGfx.newPen(winGfx.BrushType.SOLID_COLOR, [0,0,0], 1);
				//my_palette.grp.findRow.findEditText.graphics.foregroundColor = darkColorBrush;
				my_palette.grp.replaceRow.replaceEditText.graphics.foregroundColor = darkColorBrush;
				
				//my_palette.grp.findRow.findStr.preferredSize.width = my_palette.grp.replaceRow.replaceStr.preferredSize.width;
				
				//my_palette.grp.findRow.findEditText.onChange = my_palette.grp.findRow.findEditText.onChanging = onFindStringChanged;
				//my_palette.grp.findRow.mask1.onChange = my_palette.grp.findRow.mask1.onChanging = onFontStringChanged;
				//my_palette.grp.findRow.mask2.onChange = my_palette.grp.findRow.mask2.onChanging = onFontStringChanged;
				//my_palette.grp.findRow.mask3.onChange = my_palette.grp.findRow.mask3.onChanging = onFontStringChanged;
				//my_palette.grp.findRow.mask4.onChange = my_palette.grp.findRow.mask4.onChanging = onFontStringChanged;
				my_palette.grp.m1.mask5.onChange = my_palette.grp.m1.mask5.onChanging = onFontStringChanged;
				my_palette.grp.replaceRow.replaceEditText.onChange = my_palette.grp.replaceRow.replaceEditText.onChanging = onReplaceStringChanged;
				
				//my_palette.grp.findRow.selectTxtButton.onClick =onSelectFont;
				my_palette.grp.cmds.createButton.onClick    = onCreate;
				//wireThickness = my_palette.grp.cmds.fontString.value;
				//alert(wireThickness);
				//my_palette.grp.findRow.mask1.onChange    = function(){ onUpdateThickness(1, this.text)};
				//my_palette.grp.findRow.mask2.onChange    = function(){ onUpdateThickness(2, this.text)};
				//my_palette.grp.findRow.mask3.onChange    = function(){ onUpdateThickness(3, this.text)};
				//my_palette.grp.findRow.mask4.onChange    = function(){ onUpdateThickness(4, this.text)};
				my_palette.grp.m1.mask5.onChange    = function(){ onUpdateThickness(5, this.text)};
				//alert(my_palette.grp.findRow.mask1);
				//alert(my_palette.grp.findRow.fontString.value);
				//my_palette.grp.cmds.replaceButton.onClick = onReplaceAll;
				//my_palette.grp.cmds.helpButton.onClick    = onShowHelp;
				
				my_palette.onResizing = my_palette.onResize = function () {this.layout.resize();}
			
				if (my_palette instanceof Window) {
					my_palette.center();
					my_palette.show();
				} else {
					my_palette.layout.layout(true);
					my_palette.layout.resize();
				}
			}
			else {
				alert("Could not open the user interface.", scriptName);
			}
		}
	}
}



SplineWire();