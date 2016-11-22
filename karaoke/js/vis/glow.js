function Glow(){

	var glow;
    var runnerMaterial;
    var dimensions;

	this.init = function(container, objDimensions){
        dimensions = objDimensions;

        var runnerTexture = new THREE.ImageUtils.loadTexture( 'images/glow.png' );

        runnerMaterial = new THREE.MeshBasicMaterial( { 
            map: runnerTexture,
            blending:       THREE.AdditiveBlending,
            transparent:    true,
            depthTest:      false 
        });
        runnerMaterial.opacity = 0;

        var runnerGeometry = new THREE.PlaneGeometry(900, 918, 1, 1);
        glow = new THREE.Mesh(runnerGeometry, runnerMaterial);

        glow.position.x = dimensions.halfX-900*0.5;

        container.add(glow);
        
    };


    this.resize = function(objDimensions){
        runnerMaterial.opacity = 0.5;
        dimensions = objDimensions;
        glow.position.x = dimensions.halfX-900*0.5;
    };

}