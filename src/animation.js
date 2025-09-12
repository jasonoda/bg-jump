export class Animation {
    constructor() {
        this.engine = null;
        this.e = null;
        this.basePath = 'src/images/monster1/';
        this.basePath2 = 'src/images/monster2/';
        this.monsterAnimation = [];
        this.monster2Animation = [];
        this.frameImages = {};
        this.animatedSprites = [];
    }

    setUp(engine) {
        this.engine = engine;
        this.e = engine;
        this.preloadFrames();
    }

    preloadFrames() {
        // Create explicit frame URLs and preload via makeImg
        this.m1 = this.basePath + 'm_1.png'; this.makeImg(this.m1);
        this.m2 = this.basePath + 'm_2.png'; this.makeImg(this.m2);
        this.m3 = this.basePath + 'm_3.png'; this.makeImg(this.m3);
        this.m4 = this.basePath + 'm_4.png'; this.makeImg(this.m4);
        this.m5 = this.basePath + 'm_5.png'; this.makeImg(this.m5);
        this.m6 = this.basePath + 'm_6.png'; this.makeImg(this.m6);
        this.m7 = this.basePath + 'm_7.png'; this.makeImg(this.m7);

        // Manual yoyo sequence (up then down)
        this.monsterAnimation = [ this.m1, this.m2, this.m3, this.m4, this.m5, this.m6, this.m7, this.m6, this.m5, this.m4, this.m3, this.m2 ];
        // Monster 2 frames (b_1..b_6 discovered in folder)
        this.n1 = this.basePath2 + 'b_1.png'; this.makeImg(this.n1);
        this.n2 = this.basePath2 + 'b_2.png'; this.makeImg(this.n2);
        this.n3 = this.basePath2 + 'b_3.png'; this.makeImg(this.n3);
        this.n4 = this.basePath2 + 'b_4.png'; this.makeImg(this.n4);
        this.n5 = this.basePath2 + 'b_5.png'; this.makeImg(this.n5);
        this.n6 = this.basePath2 + 'b_6.png'; this.makeImg(this.n6);
        this.monster2Animation = [ this.n1, this.n2, this.n3, this.n4, this.n5, this.n6, this.n5, this.n4, this.n3, this.n2 ];
    }

    makeImg(im) {
        const img = new Image();
        img.src = im;
        this.frameImages[im] = img;
        return img;
    }

    animate() {
        
        for (var i = 0; i < this.animatedSprites.length; i++) {
            var a = this.animatedSprites[i];
            if (!a) continue;

            if (a.aniCount === undefined) {
                a.aniCount = 0;
                a.curFrame = 0;
            }

            if (a.aniSpeed === undefined) {
                a.aniSpeed = 0.12;
            }

            a.aniCount += this.e.dt;

            if (a.aniCount > a.aniSpeed) {
                a.aniCount = 0;
                a.curFrame += 1;

                if (a.curFrame >= a.ani.length) {
                    if (a.aniLoop === false) {
                        a.curFrame = a.ani.length - 1;
                    } else {
                        a.curFrame = 0;
                    }
                }

                const frameUrl = a.ani[a.curFrame];
                // Prefer <img> swapping to avoid background flicker
                if (a.img instanceof HTMLImageElement) {
                    a.img.src = frameUrl;
                } else if (a.element && a.apply === 'background') {
                    a.element.style.backgroundImage = `url('${frameUrl}')`;
                    a.element.style.backgroundSize = 'contain';
                    a.element.style.backgroundRepeat = 'no-repeat';
                    a.element.style.backgroundPosition = 'center';
                }
            }
        }
    }
}
