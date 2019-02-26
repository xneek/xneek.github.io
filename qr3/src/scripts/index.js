import '../styles/index.scss';
import QrCode from "qrcode-reader";

const file = document.getElementById('fileinput');
const canvas = document.getElementById('canvas');
const out = document.getElementById('out');
var img = new Image();
var angle = 0;
file.onchange = function(e){
    var ctx = canvas.getContext('2d');
    const file = e.target.files[0];
    console.log(file);
    var url = URL.createObjectURL(file);
    function inRad(num) {
        return num * Math.PI / 180;
    }


    img.onload = function() {
        const coef = img.naturalHeight/img.naturalWidth;
        const w =  1000;
        const h = w*coef;
        canvas.width = w;
        canvas.height = h;
        ctx.drawImage(img, 0,0, w, h);
        const imageData = ctx.getImageData(0, 0, w, h);

        var qr = new QrCode();
        qr.callback = (err, value) => {
            if(err){
                console.warn(err);

                if(angle<=90){
                    angle++;
                    ctx.translate(w/2, h/2);
                    ctx.rotate(inRad(1));
                    ctx.drawImage(img, (w/2)*-1, (h/2)*-1, w, h );
                    img.src = canvas.toDataURL();

                } else {
                    out.style.backgroundColor = 'yellow';
                    out.textContent += "\n✅ ГОТОВО!";
                }
                return;
            }
            console.log('val', value);
            out.textContent += "\n✔ "+value.result;
            if(value.points){
                value.points.forEach(p=>{
                    ctx.strokeStyle = "red";
                    ctx.fillStyle = "lime";
                    ctx.fillRect(p.x-50, p.y-50, 100, 100);
                    ctx.stroke();
                });


                console.log('Iteration', canvas.toDataURL());
                img.src = canvas.toDataURL();
            }

        };

        qr.decode(imageData);
    };

    img.src = url;
};


