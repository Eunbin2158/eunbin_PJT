let scene, camera, renderer, controls;
        let clickableObjects = []; 
        let raycaster, mouse;
        let peeyakChar; // 변수명을 컨셉에 맞게 peeyakChar로 통합하여 가독성 강화
        
        let isMoving = false;
        let targetPosition = new THREE.Vector3(1.1, 0.75, 1.1);
        const moveSpeed = 0.08;

        let animationId;
        let isHomeActive = true;

        /* 영어 공부 기록 (31일 스탬프 기록) */
        let checkedDays = JSON.parse(localStorage.getItem('eunbin_checked_days')) || [];
        function init3D() {
            const container = document.getElementById('canvas-container');
            const width = container.clientWidth;
            const height = container.clientHeight;

            scene = new THREE.Scene();
            scene.background = new THREE.Color(0xc2e0e0);

            camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
            camera.position.set(7, 6, 9);

            renderer = new THREE.WebGLRenderer({
                antialias: true,
                alpha: true,
                powerPreference: "high-performance"
            });

            renderer.setSize(width, height);
            renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
            renderer.shadowMap.enabled = true;
            renderer.shadowMap.type = THREE.PCFSoftShadowMap;
            renderer.outputEncoding = THREE.sRGBEncoding;

            // 화면 전체 밝기를 조절
            renderer.toneMapping = THREE.ACESFilmicToneMapping;
            renderer.toneMappingExposure = 1.1;

            container.appendChild(renderer.domElement);

            controls = new THREE.OrbitControls(camera, renderer.domElement);
            controls.enableDamping = true;
            controls.dampingFactor = 0.05;
            controls.maxPolarAngle = Math.PI / 2 - 0.05;
            controls.minDistance = 4;
            controls.maxDistance = 15;
            controls.target.set(0, 0.5, 0);

            // 방 전체를 고르게 밝히는 주변광
            const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
            scene.add(ambientLight);

            // 특정 방향에서 비추는 빛
            const directionalLight = new THREE.DirectionalLight(0xfff8eb, 0.60);
            directionalLight.position.set(6, 11, 6);
            directionalLight.castShadow = true;
            directionalLight.shadow.mapSize.width = 2048;
            directionalLight.shadow.mapSize.height = 2048;
            directionalLight.shadow.bias = -0.0005;
            scene.add(directionalLight);

            // 한 지점에서 퍼지는 전구 형태의 빛
            const pointLight = new THREE.PointLight(0xffceb0, 0.33, 11);
            pointLight.position.set(-2, 3, -2);
            scene.add(pointLight);
            
            createRoom();

            raycaster = new THREE.Raycaster();
            mouse = new THREE.Vector2();

            window.addEventListener('resize', onWindowResize);
            renderer.domElement.addEventListener('pointerdown', onPointerDown);
        }

        function createStripeTexture() {
            const canvas = document.createElement('canvas');
            canvas.width = 128;
            canvas.height = 128;
            const ctx = canvas.getContext('2d');
            
            ctx.fillStyle = '#e5f9f5'; 
            ctx.fillRect(0, 0, 128, 128);
            
            ctx.strokeStyle = '#a4ded0'; 
            ctx.lineWidth = 14;
            ctx.beginPath();
            ctx.moveTo(0, 64);
            ctx.lineTo(128, 64);
            ctx.stroke();
            
            const texture = new THREE.CanvasTexture(canvas);
            texture.wrapS = THREE.RepeatWrapping;
            texture.wrapT = THREE.RepeatWrapping;
            texture.repeat.set(4, 3);
            return texture;
        }

        function createGridTexture() {
            const canvas = document.createElement('canvas');
            canvas.width = 128;
            canvas.height = 128;
            const ctx = canvas.getContext('2d');
            
            ctx.fillStyle = '#eddac3'; 
            ctx.fillRect(0, 0, 128, 128);
            
            ctx.strokeStyle = '#cfb597'; 
            ctx.lineWidth = 6;
            ctx.strokeRect(0, 0, 128, 128);
            
            const texture = new THREE.CanvasTexture(canvas);
            texture.wrapS = THREE.RepeatWrapping;
            texture.wrapT = THREE.RepeatWrapping;
            texture.repeat.set(6, 6);
            return texture;
        }

        function createRoom() {
            const wallTex = createStripeTexture();
            const floorTex = createGridTexture();

            const wallMaterial = new THREE.MeshStandardMaterial({ map: wallTex, roughness: 0.8 });
            const floorMaterial = new THREE.MeshStandardMaterial({ map: floorTex, roughness: 0.9 });
            const woodMaterial = new THREE.MeshStandardMaterial({ color: 0xdcb38a, roughness: 0.7 });
            const darkWoodMaterial = new THREE.MeshStandardMaterial({ color: 0xb88b5c, roughness: 0.8 });
            const mintMaterial = new THREE.MeshStandardMaterial({ color: 0xa8e6cf, roughness: 0.5 });
            const pinkMaterial = new THREE.MeshStandardMaterial({ color: 0xffd3b6, roughness: 0.5 });
            const yellowMaterial = new THREE.MeshStandardMaterial({ color: 0xffaaa5, roughness: 0.5 });

            // 바닥 & 벽면
            const floorGeo = new THREE.BoxGeometry(6, 0.2, 6);
            const floor = new THREE.Mesh(floorGeo, floorMaterial);
            floor.position.y = -0.1;
            floor.receiveShadow = true;
            floor.userData = { id: 'floor' }; 
            scene.add(floor);
            clickableObjects.push(floor); 

            const wallLGeo = new THREE.BoxGeometry(0.2, 4.5, 6);
            const wallL = new THREE.Mesh(wallLGeo, wallMaterial);
            wallL.position.set(-2.9, 2.15, 0);
            wallL.receiveShadow = true;
            scene.add(wallL);

            const wallRGeo = new THREE.BoxGeometry(6, 4.5, 0.2);
            const wallR = new THREE.Mesh(wallRGeo, wallMaterial);
            wallR.position.set(0, 2.15, -2.9);
            wallR.receiveShadow = true;
            scene.add(wallR);

            const moldingLGeo = new THREE.BoxGeometry(0.24, 0.15, 6);
            const moldingL = new THREE.Mesh(moldingLGeo, darkWoodMaterial);
            moldingL.position.set(-2.88, 0.075, 0);
            scene.add(moldingL);

            const moldingRGeo = new THREE.BoxGeometry(6, 0.15, 0.24);
            const moldingR = new THREE.Mesh(moldingRGeo, darkWoodMaterial);
            moldingR.position.set(0, 0.075, -2.88);
            scene.add(moldingR);

            // 침대
            const bedGroup = new THREE.Group();
            bedGroup.userData = { id: 'bed' };

            const bedFrameGeo = new THREE.BoxGeometry(1.8, 0.35, 2.8);
            const bedFrame = new THREE.Mesh(bedFrameGeo, woodMaterial);
            bedFrame.position.set(0, 0.175, 0);
            bedFrame.castShadow = true;
            bedFrame.receiveShadow = true;
            bedGroup.add(bedFrame);

            const bedHeadGeo = new THREE.BoxGeometry(1.8, 1.2, 0.15);
            const bedHead = new THREE.Mesh(bedHeadGeo, woodMaterial);
            bedHead.position.set(0, 0.6, -1.325);
            bedHead.castShadow = true;
            bedGroup.add(bedHead);

            const mattressGeo = new THREE.BoxGeometry(1.65, 0.4, 2.5);
            const mattress = new THREE.Mesh(mattressGeo, new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.9 }));
            mattress.position.set(0, 0.45, 0.05);
            mattress.castShadow = true;
            mattress.receiveShadow = true;
            bedGroup.add(mattress);

            const pillowGeo = new THREE.BoxGeometry(1.2, 0.15, 0.55);
            const pillow = new THREE.Mesh(pillowGeo, pinkMaterial);
            pillow.position.set(0, 0.7, -0.8);
            pillow.rotation.x = 0.1;
            pillow.castShadow = true;
            bedGroup.add(pillow);

            const blanketGeo = new THREE.BoxGeometry(1.67, 0.45, 1.7);
            const blanket = new THREE.Mesh(blanketGeo, yellowMaterial);
            blanket.position.set(0, 0.47, 0.45);
            blanket.castShadow = true;
            bedGroup.add(blanket);

            const blanketFoldGeo = new THREE.BoxGeometry(1.67, 0.1, 0.4);
            const blanketFold = new THREE.Mesh(blanketFoldGeo, pinkMaterial);
            blanketFold.position.set(0, 0.72, -0.3);
            blanketFold.rotation.x = -0.15;
            blanketFold.castShadow = true;
            bedGroup.add(blanketFold);

            bedGroup.position.set(-1.7, 0, 1.3);
            bedGroup.rotation.y = Math.PI / 2; 
            scene.add(bedGroup);
            clickableObjects.push(bedGroup);

            // 책상 & 노트북
            const deskGroup = new THREE.Group();
            deskGroup.userData = { id: 'desk' };

            const deskTopGeo = new THREE.BoxGeometry(2.2, 0.1, 1.2);
            const deskTop = new THREE.Mesh(deskTopGeo, woodMaterial);
            deskTop.position.y = 1.0;
            deskTop.castShadow = true;
            deskTop.receiveShadow = true;
            deskGroup.add(deskTop);

            const legGeo = new THREE.BoxGeometry(0.1, 1.0, 0.1);
            const legOffsets = [
                {x: -1.0, z: -0.5}, {x: 1.0, z: -0.5},
                {x: -1.0, z: 0.5}, {x: 1.0, z: 0.5}
            ];
            legOffsets.forEach(offset => {
                const leg = new THREE.Mesh(legGeo, woodMaterial);
                leg.position.set(offset.x, 0.5, offset.z);
                leg.castShadow = true;
                deskGroup.add(leg);
            });

            // 노트북
            const laptopGroup = new THREE.Group();
            laptopGroup.position.set(0, 1.05, 0.1);
            laptopGroup.rotation.y = -0.2;

            const lapBaseGeo = new THREE.BoxGeometry(0.6, 0.02, 0.45);
            const lapBase = new THREE.Mesh(lapBaseGeo, new THREE.MeshStandardMaterial({ color: 0xd1d5db }));
            lapBase.castShadow = true;
            laptopGroup.add(lapBase);

            const lapScreenGeo = new THREE.BoxGeometry(0.6, 0.4, 0.02);
            const lapScreen = new THREE.Mesh(lapScreenGeo, new THREE.MeshStandardMaterial({ color: 0xd1d5db }));
            lapScreen.position.set(0, 0.2, -0.21);
            lapScreen.rotation.x = -0.2;
            lapScreen.castShadow = true;
            laptopGroup.add(lapScreen);

            const screenDisplayGeo = new THREE.PlaneGeometry(0.52, 0.32);
            const screenDisplayMat = new THREE.MeshBasicMaterial({ color: 0xa8e6cf }); 
            const screenDisplay = new THREE.Mesh(screenDisplayGeo, screenDisplayMat);
            screenDisplay.position.set(0, 0.21, -0.19);
            screenDisplay.rotation.x = -0.2;
            laptopGroup.add(screenDisplay);

            deskGroup.add(laptopGroup);

            // 다육이 화분
            const potGeo = new THREE.CylinderGeometry(0.1, 0.07, 0.15, 12);
            const pot = new THREE.Mesh(potGeo, new THREE.MeshStandardMaterial({ color: 0xffffff }));
            pot.position.set(-0.7, 1.1, -0.2);
            pot.castShadow = true;
            deskGroup.add(pot);

            const plantGeo = new THREE.SphereGeometry(0.08, 8, 8);
            const plant = new THREE.Mesh(plantGeo, mintMaterial);
            plant.position.set(-0.7, 1.2, -0.2);
            plant.scale.set(1, 1.4, 1);
            plant.castShadow = true;
            deskGroup.add(plant);

            deskGroup.position.set(-1.5, 0, -1.8);
            scene.add(deskGroup);
            clickableObjects.push(deskGroup);

            // 미니어처 장식장
            const cabinetGroup = new THREE.Group();
            cabinetGroup.userData = { id: 'cabinet' };

            const cabFrameGeo = new THREE.BoxGeometry(1.2, 2.2, 0.6);
            const cabFrame = new THREE.Mesh(cabFrameGeo, woodMaterial);
            cabFrame.position.y = 1.1;
            cabFrame.castShadow = true;
            cabFrame.receiveShadow = true;
            cabinetGroup.add(cabFrame);

            const shelfDepth = 0.54;
            const hShelf1Geo = new THREE.BoxGeometry(1.08, 0.06, shelfDepth);
            
            const shelf1 = new THREE.Mesh(hShelf1Geo, darkWoodMaterial);
            shelf1.position.set(0, 0.7, 0.03);
            shelf1.castShadow = true;
            cabinetGroup.add(shelf1);

            const shelf2 = new THREE.Mesh(hShelf1Geo, darkWoodMaterial);
            shelf2.position.set(0, 1.4, 0.03);
            shelf2.castShadow = true;
            cabinetGroup.add(shelf2);

            // 소품
            const m1 = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.25, 12), new THREE.MeshStandardMaterial({ color: 0xffd3b6 }));
            m1.position.set(-0.3, 0.125, 0.1);
            m1.castShadow = true;
            cabinetGroup.add(m1);

            const m2 = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.2, 0.2), new THREE.MeshStandardMaterial({ color: 0xffaaa5 }));
            m2.position.set(0.2, 0.1, 0.1);
            m2.rotation.y = 0.4;
            m2.castShadow = true;
            cabinetGroup.add(m2);

            cabinetGroup.position.set(2.0, 0, -1.8);
            scene.add(cabinetGroup);
            clickableObjects.push(cabinetGroup);

            // 🐥 3D 아기 병아리 캐릭터 '삐약이' (Peeyak) 생성 🐥
            peeyakChar = new THREE.Group();
            peeyakChar.userData = { id: 'character' };

            // 1) 삐약이 몸통/머리 통합구체 (보송보송한 파스텔 노란색 적용)
            const charBodyGeo = new THREE.SphereGeometry(0.5, 32, 32);
            charBodyGeo.scale(1, 1.15, 1);
            const charBodyMat = new THREE.MeshStandardMaterial({ color: 0xfff176, roughness: 0.6 }); // 부드러운 병아리 재질
            const charBody = new THREE.Mesh(charBodyGeo, charBodyMat);
            charBody.castShadow = true;
            peeyakChar.add(charBody);

            // 2) 부리 (주황색 고깔 콘 모양 코)
            const beakGeo = new THREE.ConeGeometry(0.08, 0.22, 5);
            const beakMat = new THREE.MeshStandardMaterial({ color: 0xff9800, roughness: 0.3 });
            const beak = new THREE.Mesh(beakGeo, beakMat);
            beak.position.set(0, 0.0, 0.52);
            beak.rotation.x = Math.PI / 2; // 정면을 가리키도록 회전
            peeyakChar.add(beak);

            // 3) 눈 (왼쪽, 오른쪽)
            const eyeGeo = new THREE.SphereGeometry(0.06, 16, 16);
            const eyeMat = new THREE.MeshBasicMaterial({ color: 0x333333 });
            const leftEye = new THREE.Mesh(eyeGeo, eyeMat);
            leftEye.position.set(-0.16, 0.1, 0.45);
            peeyakChar.add(leftEye);

            const rightEye = new THREE.Mesh(eyeGeo, eyeMat);
            rightEye.position.set(0.16, 0.1, 0.45);
            peeyakChar.add(rightEye);

            // 4) 볼터치 (Blush)
            const blushGeo = new THREE.SphereGeometry(0.08, 16, 16);
            blushGeo.scale(1, 0.5, 1);
            const blushMat = new THREE.MeshBasicMaterial({ color: 0xffb7b2, transparent: true, opacity: 0.85 });
            
            const leftBlush = new THREE.Mesh(blushGeo, blushMat);
            leftBlush.position.set(-0.3, -0.02, 0.42);
            peeyakChar.add(leftBlush);

            const rightBlush = new THREE.Mesh(blushGeo, blushMat);
            rightBlush.position.set(0.3, -0.02, 0.42);
            peeyakChar.add(rightBlush);

            // 5) 머리 위 귀여운 아기 새싹 벼슬 (주황/빨간 방울 포인트)
            const leafGroup = new THREE.Group();
            leafGroup.position.set(0, 0.65, 0);
            
            const leaf1 = new THREE.Mesh(new THREE.SphereGeometry(0.06, 8, 8), beakMat);
            leaf1.position.set(-0.04, 0, 0);
            leaf1.scale.set(1, 1.5, 1);
            leaf1.rotation.z = 0.2;
            leafGroup.add(leaf1);

            const leaf2 = new THREE.Mesh(new THREE.SphereGeometry(0.05, 8, 8), beakMat);
            leaf2.position.set(0.04, -0.02, 0);
            leaf2.scale.set(1, 1.4, 1);
            leaf2.rotation.z = -0.2;
            leafGroup.add(leaf2);

            peeyakChar.add(leafGroup);

            // 6) 양옆 아기자기한 병아리 날개
            const wingGeo = new THREE.SphereGeometry(0.08, 16, 16);
            wingGeo.scale(1.8, 1, 0.8);
            
            const leftWing = new THREE.Mesh(wingGeo, charBodyMat);
            leftWing.position.set(-0.48, -0.1, 0);
            leftWing.rotation.z = -0.3;
            leftWing.rotation.y = 0.2;
            peeyakChar.add(leftWing);

            const rightWing = new THREE.Mesh(wingGeo, charBodyMat);
            rightWing.position.set(0.48, -0.1, 0);
            rightWing.rotation.z = 0.3;
            rightWing.rotation.y = -0.2;
            peeyakChar.add(rightWing);

            // 캐릭터 시작 위치 세팅
            peeyakChar.position.set(1.1, 0.75, 1.1);
            scene.add(peeyakChar);
            clickableObjects.push(peeyakChar);

            // 러그
            const rugGeo = new THREE.CylinderGeometry(1.0, 1.0, 0.01, 32);
            const rugMat = new THREE.MeshStandardMaterial({ color: 0xffd3b6, roughness: 1.0 });
            const rug = new THREE.Mesh(rugGeo, rugMat);
            rug.position.set(1.1, 0.01, 1.1);
            rug.receiveShadow = true;
            rug.userData = { id: 'floor' }; 
            scene.add(rug);
            clickableObjects.push(rug);
        }

        function onWindowResize() {
            const container = document.getElementById('canvas-container');
            camera.aspect = container.clientWidth / container.clientHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(container.clientWidth, container.clientHeight);
        }

        function onPointerDown(event) {
            if(!isHomeActive) return; 
            const container = document.getElementById('canvas-container');
            const rect = renderer.domElement.getBoundingClientRect();
            mouse.x = ((event.clientX - rect.left) / container.clientWidth) * 2 - 1;
            mouse.y = -((event.clientY - rect.top) / container.clientHeight) * 2 + 1;

            raycaster.setFromCamera(mouse, camera);
            const intersects = raycaster.intersectObjects(clickableObjects, true);

            if (intersects.length > 0) {
                let hitObject = intersects[0].object;
                let hitPoint = intersects[0].point;

                let obj = hitObject;
                while (obj && obj.parent) {
                    if (obj.userData && obj.userData.id) {
                        handleInteraction(obj.userData.id, hitPoint);
                        break;
                    }
                    obj = obj.parent;
                }
            }
        }

        function moveTo(position) {
            targetPosition.set(position.x, 0.75, position.z);
            isMoving = true;
        }

        function handleInteraction(id, hitPoint) {
            let target = new THREE.Vector3();

            if (id === 'character') {
                showModal('안녕하세요!', '저는 만드는 즐거움을 아는 크리에이터 은빈이자, 이 방의 지킴이 병아리 삐약이랍니다. 🐥\n\n이 3D 마이룸은 제가 아끼는 수제 소품과 소소한 꿈으로 채운 특별한 세상이에요!\n바닥이나 가구를 콕콕 누르면 제가 귀엽게 삐약거리며 그곳으로 아장아장 걸어간답니다.');
                return;
            } else if (id === 'floor') {
                if (hitPoint) {
                    let clampX = Math.max(-2.6, Math.min(2.6, hitPoint.x));
                    let clampZ = Math.max(-2.6, Math.min(2.6, hitPoint.z));
                    target.set(clampX, 0.75, clampZ);
                }
            } else if (id === 'desk') {
                target.set(-0.5, 0.75, -0.8); 
                showModal('소프트웨어 프로그래밍', '뚝딱뚝딱 코딩하는 제 책상이에요!\n새로운 아이디어를 화면 속에 가상현실로 구현하는 과정을 진심으로 사랑한답니다.');
            } else if (id === 'cabinet') {
                target.set(1.0, 0.75, -0.8); 
                showModal('미니어처 장식장', '제 손끝으로 직접 완성한 아기자기한 미니어처 진열대입니다.\n소프트웨어뿐만 아니라 점토 등 물리적 재료들을 조립하는 것도 무척 즐거워해요.');
            } else if (id === 'bed') {
                target.set(-0.5, 0.75, 1.3); 
                showModal('포근한 침대', '하루 일과를 무사히 끝마치고 아늑하게 푹 쉴 수 있는 포근한 침대입니다!\n이불 속에서 더 기발하고 다채로운 상상이 피어오릅니다.');
            }

            moveTo(target);
        }

        function switchPage(pageName) {
            const homeTab = document.getElementById('tab-home');
            const aboutmeTab = document.getElementById('tab-aboutme');
            const englishTab = document.getElementById('tab-english');
            const canvasContainer = document.getElementById('canvas-container');
            const signboard = document.getElementById('signboard');
            const hintTooltip = document.getElementById('hint-tooltip');
            const aboutMePage = document.getElementById('about-me-page');
            const englishPage = document.getElementById('english-page');


            // MPA에서는 현재 페이지의 고유 영역만 존재하므로 실제 HTML 파일로 이동합니다.
            // 원본 SPA 구조처럼 모든 페이지 영역이 함께 존재하는 경우에는 아래 원본 로직이 그대로 실행됩니다.
            if (!canvasContainer || !signboard || !hintTooltip || !aboutMePage || !englishPage) {
                const pageMap = {
                    home: 'index.html',
                    aboutme: 'about.html',
                    portfolio: 'portfolio.html',
                    miniature: 'miniature.html',
                    english: 'english.html'
                };
                const destination = pageMap[pageName];
                if (destination) {
                    window.location.href = destination;
                }
                return;
            }

            homeTab.classList.remove('active');
            aboutmeTab.classList.remove('active');
            if (englishTab) englishTab.classList.remove('active');

            if (pageName === 'home') {
                isHomeActive = true;
                homeTab.classList.add('active');
                
                canvasContainer.style.opacity = '1';
                canvasContainer.style.pointerEvents = 'auto';
                signboard.style.opacity = '1';
                hintTooltip.style.opacity = '1';
                
                aboutMePage.classList.remove('active');
                if (englishPage) englishPage.classList.remove('active');
                
                animate();
            } else if (pageName === 'aboutme') {
                isHomeActive = false;
                aboutmeTab.classList.add('active');

                canvasContainer.style.opacity = '0';
                canvasContainer.style.pointerEvents = 'none';
                signboard.style.opacity = '0';
                hintTooltip.style.opacity = '0';

                aboutMePage.classList.add('active');
                if (englishPage) englishPage.classList.remove('active');

                if(animationId) {
                    cancelAnimationFrame(animationId);
                }
            } else if (pageName === 'english') {
                isHomeActive = false;
                if (englishTab) englishTab.classList.add('active');

                canvasContainer.style.opacity = '0';
                canvasContainer.style.pointerEvents = 'none';
                signboard.style.opacity = '0';
                hintTooltip.style.opacity = '0';

                aboutMePage.classList.remove('active');
                if (englishPage) englishPage.classList.add('active');

                if(animationId) {
                    cancelAnimationFrame(animationId);
                }
                renderStamps(); // 페이지 진입 시 최신 스탬프 상태 렌더링
            }
        }

        /* 31일 동글동글 원형 스탬프 판 생성 및 인터랙션 (image_e414b1.png 참고) */
        function renderStamps() {
            const container = document.getElementById('stamp-grid-container');
            if (!container) return;
            container.innerHTML = '';

            // 1일부터 31일까지 깔끔한 원형 스탬프 생성
            for (let day = 1; day <= 31; day++) {
                const isStamped = checkedDays.includes(day);
                const stamp = document.createElement('div');
                stamp.className = `stamp-circle ${isStamped ? 'stamped' : ''}`;
                stamp.innerText = day;
                stamp.title = `${day}일 스탬프`;
                
                stamp.onclick = () => toggleStamp(day);
                container.appendChild(stamp);
            }

            updateProgress();
        }

        function toggleStamp(day) {
            if (checkedDays.includes(day)) {
                checkedDays = checkedDays.filter(d => d !== day);
            } else {
                checkedDays.push(day);
            }
            localStorage.setItem('eunbin_checked_days', JSON.stringify(checkedDays));
            renderStamps();
        }

        function resetStamps() {
            // 가이드라인을 준수하여 브라우저 기본 confirm() 대화상자 대신 직접 리셋 후 재출력
            checkedDays = [];
            localStorage.setItem('eunbin_checked_days', JSON.stringify(checkedDays));
            renderStamps();
        }

        function updateProgress() {
            const totalDays = 31;
            const percent = Math.round((checkedDays.length / totalDays) * 100);
            
            // 2 * PI * r = 2 * 3.14159 * 58 = 364.42 (원주 길이)
            const strokeDashoffset = 364.42 - (364.42 * percent) / 100;
            const ring = document.getElementById('progress-ring');
            if (ring) {
                ring.style.strokeDashoffset = strokeDashoffset;
            }

            const percentText = document.getElementById('progress-percent');
            if (percentText) {
                percentText.innerText = `${percent}%`;
            }

            // 진척도별 동적 삐약이 메세지 변경
            const message = document.getElementById('progress-message');
            if (message) {
                if (percent === 100) {
                    message.innerText = '한 달 올클리어 달성! 삐약이와 함께 영어를 마스터했어요! 🎉🐣';
                } else if (percent >= 70) {
                    message.innerText = '스탬프 판이 삐약이로 가득해요! 정말 대단한 끈기입니다! 🔥🐥';
                } else if (percent >= 40) {
                    message.innerText = '벌써 스탬프가 절반 가까이 모였어요! 조금만 더 힘내봐요! 👍';
                } else if (percent > 0) {
                    message.innerText = '스탬프가 채워질 때마다 실력이 무한히 성장해요! 🐥';
                } else {
                    message.innerText = '공부한 날짜의 원형 칸을 클릭해 삐약이 도장을 쾅 찍어보세요! 🐥';
                }
            }
        }

        let clock = new THREE.Clock();
        function animate() {
            if (!isHomeActive) return; 

            animationId = requestAnimationFrame(animate);
            const elapsedTime = clock.getElapsedTime();

            if (peeyakChar) {
                if (isMoving) {
                    peeyakChar.position.lerp(targetPosition, moveSpeed);
                    if (peeyakChar.position.distanceTo(targetPosition) < 0.05) {
                        isMoving = false;
                    }
                }

                // 이동할 때 통통 튀며 종걸걸음 걷는 느낌의 연출 추가 (사인파 주파수 증폭)
                const bobOffset = Math.sin(elapsedTime * (isMoving ? 6.5 : 2.5)) * 0.08;
                peeyakChar.position.y = (isMoving ? 0.75 : 0.65) + bobOffset;
                peeyakChar.rotation.y = elapsedTime * 0.4;
            }

            controls.update();
            renderer.render(scene, camera);
        }

        // BGM 토글 로직
        const bgmToggle = document.getElementById('bgmToggle');
        const bgmText = document.getElementById('bgmText');
        let isBgmPlaying = false;

        bgmToggle.addEventListener('click', () => {
            isBgmPlaying = !isBgmPlaying;
            if (isBgmPlaying) {
                bgmToggle.classList.add('bgm-playing');
                bgmText.innerText = 'BGM ON';
            } else {
                bgmToggle.classList.remove('bgm-playing');
                bgmText.innerText = 'BGM OFF';
            }
        });

        // 모달 로직
        const modalOverlay = document.getElementById('modalOverlay');
        const modalTitle = document.getElementById('modalTitle');
        const modalText = document.getElementById('modalText');

        function showModal(title, text) {
            modalTitle.innerText = title;
            modalText.innerText = text;
            modalOverlay.classList.add('active');
        }

        function closeModal() {
            modalOverlay.classList.remove('active');
        }

        modalOverlay.addEventListener('click', (e) => {
            if (e.target === modalOverlay) {
                closeModal();
            }
        });
