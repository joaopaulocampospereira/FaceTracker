import detectionControl from './detectionControl.js';

let detections;
let results;
let canvas;

const cam = document.getElementById('cam');

// Recebendo as imagens da câmera

const startVideo = () => {
    navigator.mediaDevices.enumerateDevices()
        .then(devices => {
            if (Array.isArray(devices)){
                devices.forEach(device => {
                    if (device.kind === 'videoinput') {
                        navigator.getUserMedia(
                            { video: {
                                deviceID: device.deviceId
                            }},
                            stream => cam.srcObject = stream,
                            error => console.error(error)
                        );
                    }
                });
            }
        });
}

// Registro de pessoas conhecidas e recebendo referências

const loadLabels = () => {
    try {
        const labels = ['Josaphat Campos'];
        return Promise.all(labels.map(async label => {
            const descriptions = [];
            for (let i = 1; i <= 5; i++) {
                const img = await faceapi.fetchImage(`/assets/lib/face-api/labels/${label}/${i}.jpeg`);
                const singleDetections = await faceapi
                    .detectSingleFace(img)
                    .withFaceLandmarks()
                    .withFaceDescriptor();
                descriptions.push(singleDetections.descriptor);
            }
        return new faceapi.LabeledFaceDescriptors(label, descriptions);
    }));
    } catch (error) {
        return console.error(error);
    }
    
}

// Importando Models

Promise.all([
    faceapi.nets.tinyFaceDetector.loadFromUri('/assets/lib/face-api/models'),
    faceapi.nets.faceLandmark68Net.loadFromUri('/assets/lib/face-api/models'),
    faceapi.nets.faceRecognitionNet.loadFromUri('/assets/lib/face-api/models'),
    faceapi.nets.faceExpressionNet.loadFromUri('/assets/lib/face-api/models'),
    faceapi.nets.ageGenderNet.loadFromUri('/assets/lib/face-api/models'),
    faceapi.nets.ssdMobilenetv1.loadFromUri('/assets/lib/face-api/models')
]).then(startVideo);

// Definindo onde é o canvas

cam.addEventListener('play', async () => {
    canvas = faceapi.createCanvasFromMedia(cam);
    const canvasSize = {
        width: cam.width,
        height: cam.height
    }

    const labels = await loadLabels();

    // Detectando as faces

    faceapi.matchDimensions(canvas, canvasSize)
    document.body.appendChild(canvas);
    setInterval(async () => {
        detections = await faceapi
            .detectAllFaces(
                cam, 
                new faceapi.TinyFaceDetectorOptions()
            )
            .withFaceLandmarks()
            .withFaceExpressions()
            .withAgeAndGender()
            .withFaceDescriptors();

            const resizedDetections = faceapi.resizeResults(detections, canvasSize);
            const faceMatcher = new faceapi.FaceMatcher(labels, 0.6);
            results = await resizedDetections.map(d => 
                faceMatcher.findBestMatch(d.descriptor)
            );

            // Desenhando no canvas

            canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height)
            faceapi.draw.drawDetections(canvas, resizedDetections);
            faceapi.draw.drawFaceLandmarks(canvas, resizedDetections);
            faceapi.draw.drawFaceExpressions(canvas, resizedDetections);
            resizedDetections.forEach(detection => {
                const { age, gender, genderProbability } = detection;
                new faceapi.draw.DrawTextField([
                    `${parseInt(age, 10)}years`,
                    `${gender} (${parseInt(genderProbability * 100, 10)})`
                ], detection.detection.box.topRight).draw(canvas, resizedDetections);
            });

            // identificando pessoas conhecidas

            results.forEach((result, index) => {
                const box = resizedDetections[index].detection.box;
                const { label, distance } = result;

                new faceapi.draw.DrawTextField([
                    `${label} (${parseInt(distance * 100, 10)})`
                ], box.bottomRight).draw(canvas);                
            });
            detectionControl();
    }, 100);
});
export {results, detections, canvas};