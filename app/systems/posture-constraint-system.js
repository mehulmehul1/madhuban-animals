class PostureConstraintSystem {
    static getJointConstraints(creatureType, jointType) {
        const constraints = {
            horse: {
                shoulder: {
                    minAngle: -30,      // Limited forward swing
                    maxAngle: 60,       // Good backward swing  
                    abductionMax: 25,   // Limited lateral movement
                    vertical: true      // Primarily vertical plane
                },
                hip: {
                    minAngle: -45,      // Powerful backward extension
                    maxAngle: 30,       // Limited forward swing
                    abductionMax: 20,   // Minimal lateral
                    vertical: true
                }
            },
            lizard: {
                shoulder: {
                    minAngle: -60,      // Wide range
                    maxAngle: 60,       
                    abductionMax: 90,   // Very wide lateral movement
                    vertical: false     // Horizontal plane movement
                },
                hip: {
                    minAngle: -60,      
                    maxAngle: 60,
                    abductionMax: 85,   // Wide lateral movement
                    vertical: false
                }
            }
        };
        
        return constraints[creatureType]?.[jointType] || {};
    }
}