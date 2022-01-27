var detectionCount = 100;
var identifiedNames = [];
var detectionNumber;

import { results, detections } from "./index.js";
//import printer from "./printer.js";

export default function detectionControl() {
    results.forEach( async(result) => {
        const { label } = result;
    
        if(detectionCount < 100){
            detectionCount++;
        }else{
    
    
            detectionNumber = detections.length;
            
    
            console.log(detectionNumber);
    
            if(identifiedNames.length < detectionNumber.length){
                let alreadyIdentified = identifiedNames.find(face => face === label);
    
                if (alreadyIdentified == undefined) {
                    identifiedNames.push(label);
                    console.log(identifiedNames);
                }else{
                    console.log(identifiedNames);
                };
            }else{
                async function reWrite() {
                    identifiedNames = [];
                }
    
                await reWrite();
                let alreadyIdentified = identifiedNames.find(face => face === label);
    
                if (alreadyIdentified == undefined) {
                    identifiedNames.push(label);
                    console.log(identifiedNames);
                }else{
                    console.log(identifiedNames);
                };
            }
            detectionCount = 0;

            let identifyUnknown = identifiedNames.find(face => face === 'unknown')

            /*
            if (identifyUnknown != undefined){
                printer();
            }
            */
            
        }         
    });
}

