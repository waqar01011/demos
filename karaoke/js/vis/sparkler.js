function Sparkler(){
	 // Sparkler
    var sparkler;
    var sparklerAnim;
    var fairyDust = [];
    var dimensions;

    var numparticles = 150;
    var fairyDust = [];

    var geoms = [];
    var matrs = [];

    var scales = [];
    var speeds = [];

    var container;
    var oldPos = 0;
    var rotation = 0;
    var sparkleTexture;


	this.init = function(cont, objDimensions){
        container = cont;
        dimensions = objDimensions;

        var runnerTexture = new THREE.ImageUtils.loadTexture( 'images/bengalSeq2.png' );
        sparkleTexture = new THREE.ImageUtils.loadTexture( 'images/sparkle.png' );

        sparklerAnim = new TextureAnimator( runnerTexture, 4, 4, 16, 30 ); // texture, #horiz, #vert, #total, duration.

        var runnerMaterial = new THREE.MeshBasicMaterial( { 
            map: runnerTexture,
            //blending:       THREE.AdditiveBlending,
            transparent:    true,
            depthTest:      false 
        });
        var runnerGeometry = new THREE.PlaneGeometry(200, 200, 1, 1);
        sparkler = new THREE.Mesh(runnerGeometry, runnerMaterial);
        sparkler.position.z = 10;

        container.add(sparkler);
        
    }

    this.resize = function(objDimensions){
        dimensions = objDimensions;
    }

    this.update = function(delta, dimensions, songState){
        
        var accuracy = (Karaoke.soundPitch > 1)? (1.2-Karaoke.soundPitch)/0.2 : (Karaoke.soundPitch - 0.8)/0.2;
        if(accuracy < 0)accuracy = 0;
        if(accuracy > 0.9)accuracy = 1;
        accuracy = accuracy*accuracy*accuracy;

        sparkler.scale.x = sparkler.scale.y = sparkler.scale.z = 0.5+0.5*accuracy;
        
        var newposition, diff, newRot;

        if(songState == 0){
            newposition = dimensions.halfY - dimensions.height * dimensions.mousePercY;
        }else{
            newposition = (dimensions.halfY - dimensions.height * dimensions.mousePercX)  * (dimensions.width/dimensions.height);
        }

        sparklerAnim.update(1000 * delta);
        sparkler.position.y = newposition;

        diff = oldPos-newposition;
        oldPos = newposition;
        newRot = diff*2;
        if(newRot<-90)newRot = -90;
        if(newRot>90)newRot = 90;
        sparkler.rotation.z = -newRot * (Math.PI / 180);

        
        // -------------------------------------
        // check if new bubble should be added
        // -------------------------------------
        if(fairyDust.length < numparticles*accuracy){
            var material = new THREE.MeshBasicMaterial({
                map: sparkleTexture,
                wireframe: false,
                blending: THREE.AdditiveBlending,
                transparent: true
            });
            material.opacity = 0.2 + Math.random()*0.2;

            var geometry =  new THREE.PlaneGeometry( 21 , 21 );

            var star = new THREE.Mesh( geometry, material );
            star.position.x = 0;
            star.position.y = sparkler.position.y -15 + Math.random()*30;
            star.position.z = sparkler.position.z + 0.1;
            star.scale.x = star.scale.y = star.scale.z = 0.3+1.7*Math.random(); 
            container.add( star );
            
            fairyDust.push(star);
            geoms.push(geometry);
            matrs.push(material);
            speeds.push(6 + 8*Math.random());
            scales.push(star.scale.x);

        }


        var b;
        // move bubbles
        for (b = fairyDust.length-1; b>=0; b--){
            var bubble = fairyDust[b];
            var s = speeds[b];
            bubble.position.x -= s;
            bubble.scale.x = bubble.scale.y = bubble.scale.z = scales[b] * (1- (bubble.position.x / -200));

            if(bubble.position.x <= -200){
                var matr = matrs[b];
                var geom = geoms[b]; 

                fairyDust.splice(b, 1);
                matrs.splice(b, 1);
                geoms.splice(b, 1);
                speeds.splice(b, 1);
                scales.splice(b, 1);

                container.remove( bubble );
                geom.dispose();
                matr.dispose();
            }
            
        }
    }
}