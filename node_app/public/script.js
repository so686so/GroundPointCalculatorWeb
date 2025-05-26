// script.js
document.addEventListener('DOMContentLoaded', () => {
    // --- 공통 요소 및 상태 변수 ---
    const btnShowCreatePage = document.getElementById('btnShowCreatePage');
    const btnShowCalcPage = document.getElementById('btnShowCalcPage');
    const createPage = document.getElementById('createPage');
    const calcPage = document.getElementById('calcPage');

    function showPage(pageToShow, buttonToActivate) {
        [createPage, calcPage].forEach(page => page.classList.remove('active-page'));
        [btnShowCreatePage, btnShowCalcPage].forEach(btn => btn.classList.remove('active'));
        pageToShow.classList.add('active-page');
        buttonToActivate.classList.add('active');
    }

    btnShowCreatePage.addEventListener('click', () => showPage(createPage, btnShowCreatePage));
    btnShowCalcPage.addEventListener('click', () => {
        showPage(calcPage, btnShowCalcPage);
        loadSavedMapsForCalc();
    });

    // --- GroundMap 생성 페이지 요소 ---
    // (이 부분은 변경 없음 - 이전 코드와 동일)
    const mapNameInput = document.getElementById('mapNameInput');
    const planeWidthInput = document.getElementById('planeWidthInput');
    const planeHeightInput = document.getElementById('planeHeightInput');
    const btnCreateNewMap = document.getElementById('btnCreateNewMap');
    const pointNameInput = document.getElementById('pointNameInput');
    const pointXInput = document.getElementById('pointXInput');
    const pointYInput = document.getElementById('pointYInput');
    const btnAddPoint = document.getElementById('btnAddPoint');
    const createMapCanvas = document.getElementById('createMapCanvas');
    const pointListCreateUl = document.querySelector('#pointListCreate ul');
    const btnSaveMap = document.getElementById('btnSaveMap');
    const btnExportMapFileCreate = document.getElementById('btnExportMapFileCreate');
    const savedMapsSelectCreate = document.getElementById('savedMapsSelectCreate');
    const btnLoadSelectedMapCreate = document.getElementById('btnLoadSelectedMapCreate');
    const jsonFileInputCreate = document.getElementById('jsonFileInputCreate');
    const btnLoadExternalJsonCreate = document.getElementById('btnLoadExternalJsonCreate');

    let currentMapData = {
        mapName: '',
        planeWidth: 600,
        planeHeight: 400,
        points: []
    };
    const ctxCreate = createMapCanvas.getContext('2d');

    function setupCreateCanvas() {
        if (!currentMapData || isNaN(currentMapData.planeWidth) || currentMapData.planeWidth <= 0 || isNaN(currentMapData.planeHeight) || currentMapData.planeHeight <= 0) {
            console.warn("setupCreateCanvas: 유효하지 않은 plane 크기입니다. 기본값을 사용합니다.");
            currentMapData.planeWidth = currentMapData.planeWidth || 600;
            currentMapData.planeHeight = currentMapData.planeHeight || 400;
        }
        const aspectRatio = currentMapData.planeWidth / currentMapData.planeHeight;
        const parentWidth = createMapCanvas.parentElement.clientWidth;
        let newCanvasWidth = parentWidth;
        let newCanvasHeight = parentWidth / aspectRatio;
        const maxCanvasHeight = Math.min(window.innerHeight * 0.7, 600);
        if (newCanvasHeight > maxCanvasHeight) {
            newCanvasHeight = maxCanvasHeight;
            newCanvasWidth = maxCanvasHeight * aspectRatio;
        }
        if (newCanvasWidth <= 0 || newCanvasHeight <=0) {
            console.warn("setupCreateCanvas: 계산된 캔버스 크기가 유효하지 않습니다.");
            return;
        }
        createMapCanvas.width = newCanvasWidth;
        createMapCanvas.height = newCanvasHeight;
        createMapCanvas.style.width = `${newCanvasWidth}px`;
        createMapCanvas.style.height = `${newCanvasHeight}px`;
        drawCreateMap();
    }

    new ResizeObserver(() => {
        setupCreateCanvas();
    }).observe(createMapCanvas.parentElement);

    function initializeCreateMap() {
        currentMapData.mapName = mapNameInput.value.trim() || 'UntitledMap';
        currentMapData.planeWidth = parseFloat(planeWidthInput.value) || 600;
        currentMapData.planeHeight = parseFloat(planeHeightInput.value) || 400;
        currentMapData.points = [];
        mapNameInput.value = currentMapData.mapName;
        planeWidthInput.value = currentMapData.planeWidth;
        planeHeightInput.value = currentMapData.planeHeight;
        updatePointListCreate();
        setupCreateCanvas();
        jsonFileInputCreate.value = '';
        console.log('새 GroundMap 생성/초기화:', currentMapData);
    }

    function addPointToCreateMap() {
        const name = pointNameInput.value.trim();
        const x = parseFloat(pointXInput.value);
        const y = parseFloat(pointYInput.value);
        if (!name) {
            alert('점 이름을 입력하세요.');
            return;
        }
        if (isNaN(x) || isNaN(y)) {
            alert('유효한 숫자 형식의 좌표값을 입력하세요.');
            return;
        }
        if (x < 0 || x > currentMapData.planeWidth || y < 0 || y > currentMapData.planeHeight) {
            alert(`좌표는 X축 [0, ${currentMapData.planeWidth.toFixed(2)}], Y축 [0, ${currentMapData.planeHeight.toFixed(2)}] 범위 내에 있어야 합니다.`);
            return;
        }
        currentMapData.points.push({ name, x, y });
        updatePointListCreate();
        drawCreateMap();
        pointNameInput.value = `P${currentMapData.points.length + 1}`;
        pointXInput.value = 0;
        pointYInput.value = 0;
        pointNameInput.focus();
    }

    function updatePointListCreate() {
        pointListCreateUl.innerHTML = '';
        currentMapData.points.forEach((point, index) => {
            const li = document.createElement('li');
            li.textContent = `${point.name}: (${point.x.toFixed(2)}, ${point.y.toFixed(2)})`;
            const deleteBtn = document.createElement('button');
            deleteBtn.textContent = '삭제';
            deleteBtn.style.marginLeft = '10px';
            deleteBtn.style.padding = '2px 5px';
            deleteBtn.style.fontSize = '0.8em';
            deleteBtn.onclick = () => deletePointCreate(index);
            li.appendChild(deleteBtn);
            pointListCreateUl.appendChild(li);
        });
    }

    function deletePointCreate(index) {
        if (index >= 0 && index < currentMapData.points.length) {
            currentMapData.points.splice(index, 1);
            updatePointListCreate();
            drawCreateMap();
        }
    }

    function drawCreateMap() {
        const canvasActualWidth = createMapCanvas.width;
        const canvasActualHeight = createMapCanvas.height;
        ctxCreate.clearRect(0, 0, canvasActualWidth, canvasActualHeight);
        if (isNaN(currentMapData.planeWidth) || currentMapData.planeWidth <= 0 || isNaN(currentMapData.planeHeight) || currentMapData.planeHeight <= 0) {
            console.warn("drawCreateMap: 유효하지 않은 plane 크기로 인해 그리기를 건너<0xEB><0x8A><0xB5>니다.");
            return;
        }
        const scaleX = canvasActualWidth / currentMapData.planeWidth;
        const scaleY = canvasActualHeight / currentMapData.planeHeight;
        ctxCreate.strokeStyle = '#e0e0e0';
        ctxCreate.lineWidth = 0.5;
        const gridCount = 10;
        for (let i = 0; i <= gridCount; i++) {
            const xGridPosOnPlane = (i * currentMapData.planeWidth / gridCount);
            const xGridCanvasPos = xGridPosOnPlane * scaleX;
            ctxCreate.beginPath(); ctxCreate.moveTo(xGridCanvasPos, 0); ctxCreate.lineTo(xGridCanvasPos, canvasActualHeight); ctxCreate.stroke();
            const yGridPosOnPlane = (i * currentMapData.planeHeight / gridCount);
            const yGridCanvasPos = canvasActualHeight - (yGridPosOnPlane * scaleY);
            ctxCreate.beginPath(); ctxCreate.moveTo(0, yGridCanvasPos); ctxCreate.lineTo(canvasActualWidth, yGridCanvasPos); ctxCreate.stroke();
        }
        ctxCreate.strokeStyle = '#888';
        ctxCreate.lineWidth = 1;
        ctxCreate.beginPath(); ctxCreate.moveTo(0, 0); ctxCreate.lineTo(0, canvasActualHeight); ctxCreate.stroke();
        ctxCreate.beginPath(); ctxCreate.moveTo(0, canvasActualHeight); ctxCreate.lineTo(canvasActualWidth, canvasActualHeight); ctxCreate.stroke();
        currentMapData.points.forEach(point => {
            const canvasX = point.x * scaleX;
            const canvasY = canvasActualHeight - (point.y * scaleY);
            ctxCreate.beginPath(); ctxCreate.arc(canvasX, canvasY, 5, 0, Math.PI * 2); ctxCreate.fillStyle = 'blue'; ctxCreate.fill();
            ctxCreate.fillStyle = 'black'; ctxCreate.font = '12px Arial';
            ctxCreate.fillText(`${point.name}(${point.x.toFixed(2)},${point.y.toFixed(2)})`, canvasX + 8, canvasY - 8);
        });
    }

    async function saveMapToServer() {
        currentMapData.mapName = mapNameInput.value.trim() || 'UntitledMap';
        currentMapData.planeWidth = parseFloat(planeWidthInput.value);
        currentMapData.planeHeight = parseFloat(planeHeightInput.value);
        if (!currentMapData.mapName) { alert('GroundMap 이름을 입력하세요.'); return; }
        if (isNaN(currentMapData.planeWidth) || currentMapData.planeWidth <=0 || isNaN(currentMapData.planeHeight) || currentMapData.planeHeight <=0) { alert('유효한 Plane 너비와 높이를 입력하세요 (0보다 큰 숫자).'); return; }
        if (currentMapData.points.length === 0 && !confirm("점이 하나도 없습니다. 빈 맵을 서버에 저장하시겠습니까?")) { return; }
        const dataToSave = { mapName: currentMapData.mapName, planeWidth: currentMapData.planeWidth, planeHeight: currentMapData.planeHeight, points: currentMapData.points };
        try {
            const response = await fetch('/api/save-groundmap', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(dataToSave) });
            const result = await response.json();
            if (result.success) { alert(`GroundMap '${result.fileName}'이(가) 서버에 성공적으로 저장되었습니다.`); loadSavedMapsForCreate(); loadSavedMapsForCalc(); }
            else { alert(`GroundMap 서버 저장 실패: ${result.message}`); }
        } catch (error) { console.error('서버 저장 API 호출 오류:', error); alert('GroundMap 서버 저장 중 오류가 발생했습니다.'); }
    }

    function exportCreateMapToJsonFile() {
        currentMapData.mapName = mapNameInput.value.trim() || 'UntitledMap';
        currentMapData.planeWidth = parseFloat(planeWidthInput.value);
        currentMapData.planeHeight = parseFloat(planeHeightInput.value);
        if (!currentMapData.mapName) { alert('GroundMap 이름을 입력하세요.'); return; }
        if (isNaN(currentMapData.planeWidth) || currentMapData.planeWidth <= 0 || isNaN(currentMapData.planeHeight) || currentMapData.planeHeight <= 0) { alert('유효한 Plane 너비와 높이를 입력하세요 (0보다 큰 숫자).'); return; }
        if (currentMapData.points.length === 0 && !confirm("점이 하나도 없습니다. 빈 맵을 파일로 내보내시겠습니까?")) { return; }
        const dataToExport = { mapName: currentMapData.mapName, planeWidth: currentMapData.planeWidth, planeHeight: currentMapData.planeHeight, points: currentMapData.points.map(p => ({ name: p.name, x: p.x, y: p.y })) };
        const dataStr = JSON.stringify(dataToExport, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const fileName = (currentMapData.mapName.replace(/[^a-z0-9_\-]/gi, '_') || 'GroundMapExport') + `_${Date.now()}.json`;
        a.download = fileName; document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
        alert(`'${fileName}' 파일이 다운로드됩니다.`);
    }

    function loadExternalJsonCreate() {
        const file = jsonFileInputCreate.files[0];
        if (!file) { alert('불러올 JSON 파일을 선택하세요.'); return; }
        const reader = new FileReader();
        reader.onload = function(event) {
            try {
                const jsonData = JSON.parse(event.target.result);
                if (typeof jsonData.mapName !== 'string' || (typeof jsonData.planeWidth !== 'number' && typeof jsonData.planeSize !== 'number') || (typeof jsonData.planeHeight !== 'number' && typeof jsonData.planeSize !== 'number') || !Array.isArray(jsonData.points)) {
                    throw new Error('잘못된 JSON 파일 형식입니다. mapName, (planeWidth, planeHeight 또는 planeSize), points 필드를 확인하세요.');
                }
                jsonData.points.forEach((p, i) => { if (typeof p.name !== 'string' || typeof p.x !== 'number' || typeof p.y !== 'number') { throw new Error(`잘못된 점 데이터 형식입니다 (인덱스: ${i}).`);}});
                currentMapData.mapName = jsonData.mapName;
                currentMapData.planeWidth = parseFloat(jsonData.planeWidth || jsonData.planeSize || 600);
                currentMapData.planeHeight = parseFloat(jsonData.planeHeight || jsonData.planeSize || (jsonData.planeWidth ? jsonData.planeWidth : 400));
                currentMapData.points = jsonData.points.map(p => ({ name: p.name, x: parseFloat(p.x), y: parseFloat(p.y) }));
                mapNameInput.value = currentMapData.mapName; planeWidthInput.value = currentMapData.planeWidth; planeHeightInput.value = currentMapData.planeHeight;
                updatePointListCreate(); setupCreateCanvas();
                alert(`'${file.name}' 파일에서 GroundMap을 성공적으로 불러왔습니다.`);
            } catch (e) { console.error('외부 JSON 파일 처리 오류:', e); alert(`외부 JSON 파일을 불러오는 중 오류가 발생했습니다: ${e.message}`);
            } finally { jsonFileInputCreate.value = ''; }
        };
        reader.onerror = function() { alert('파일을 읽는 중 오류가 발생했습니다.'); jsonFileInputCreate.value = ''; };
        reader.readAsText(file);
    }

    async function loadSavedMapsForCreate() {
        try {
            const response = await fetch('/api/list-groundmaps'); const result = await response.json();
            if (result.success) {
                savedMapsSelectCreate.innerHTML = '<option value="">-- 불러올 Map 선택 --</option>';
                result.files.forEach(fileName => { const option = document.createElement('option'); option.value = fileName; option.textContent = fileName.replace('.json', ''); savedMapsSelectCreate.appendChild(option); });
            } else { console.error('저장된 Map 목록 불러오기 실패:', result.message); }
        } catch (error) { console.error('Map 목록 API 호출 오류:', error); }
    }

    async function loadSelectedMapForCreate() {
        const fileName = savedMapsSelectCreate.value; if (!fileName) { alert('불러올 GroundMap을 선택하세요.'); return; }
        try {
            const response = await fetch(`/api/load-groundmap/${fileName}`); const result = await response.json();
            if (result.success) {
                const loadedData = result.data;
                currentMapData.mapName = loadedData.mapName;
                currentMapData.planeWidth = parseFloat(loadedData.planeWidth || loadedData.planeSize || 600);
                currentMapData.planeHeight = parseFloat(loadedData.planeHeight || loadedData.planeSize || (loadedData.planeWidth ? loadedData.planeWidth : 400));
                currentMapData.points = loadedData.points.map(p => ({ name: p.name, x: parseFloat(p.x), y: parseFloat(p.y) }));
                mapNameInput.value = currentMapData.mapName; planeWidthInput.value = currentMapData.planeWidth; planeHeightInput.value = currentMapData.planeHeight;
                updatePointListCreate(); setupCreateCanvas();
                alert(`'${currentMapData.mapName}'을(를) 불러왔습니다.`);
            } else { alert(`GroundMap 불러오기 실패: ${result.message}`); }
        } catch (error) { console.error('불러오기 API 호출 오류:', error); alert('GroundMap 불러오기 중 오류가 발생했습니다.'); }
    }

    btnCreateNewMap.addEventListener('click', initializeCreateMap);
    btnAddPoint.addEventListener('click', addPointToCreateMap);
    btnSaveMap.addEventListener('click', saveMapToServer);
    btnExportMapFileCreate.addEventListener('click', exportCreateMapToJsonFile);
    btnLoadSelectedMapCreate.addEventListener('click', loadSelectedMapForCreate);
    btnLoadExternalJsonCreate.addEventListener('click', loadExternalJsonCreate);


    // --- GroundMap 연산 페이지 요소 ---
    const savedMapsSelectCalc = document.getElementById('savedMapsSelectCalc');
    const btnLoadMapForCalc = document.getElementById('btnLoadMapForCalc');
    const calcMapCanvas = document.getElementById('calcMapCanvas');
    const pointListCalcUl = document.querySelector('#pointListCalc ul');
    const translateXInput = document.getElementById('translateX');
    const translateYInput = document.getElementById('translateY');
    const btnTranslate = document.getElementById('btnTranslate');
    const rotateAngleInput = document.getElementById('rotateAngle');
    const btnRotate = document.getElementById('btnRotate');
    const btnReflect = document.getElementById('btnReflect');
    const btnResetOperations = document.getElementById('btnResetOperations');
    const btnUndoOperation = document.getElementById('btnUndoOperation');
    const operationHistoryUl = document.getElementById('operationHistory');
    const btnExportJson = document.getElementById('btnExportJson');
    const btnExportCsv = document.getElementById('btnExportCsv');
    const btnZoomInCalc = document.getElementById('btnZoomInCalc');
    const btnZoomOutCalc = document.getElementById('btnZoomOutCalc');
    const currentZoomLevelCalcSpan = document.getElementById('currentZoomLevelCalc');

    let originalMapDataForCalc = null;
    let currentCalcMapData = {
        mapName: '',
        sourcePlaneWidth: 500,
        sourcePlaneHeight: 500,
        points: [],
        groundMapOriginX: 0,
        groundMapOriginY: 0,
        // NEW: Store GroundMap's local axis orientation
        groundMapAxisX: { x: 1, y: 0 }, // GM's X-axis direction in Main Plane
        groundMapAxisY: { x: 0, y: 1 }  // GM's Y-axis direction in Main Plane
    };
    let operationHistory = [];
    let mainPlaneLogicalExtentCalc = 20;

    // NEW: Panning state variables
    let isPanningCalc = false;
    let lastPanX_canvas, lastPanY_canvas; // Canvas coordinates
    let viewOffsetX_calc = 0; // Logical units of offset (center of view)
    let viewOffsetY_calc = 0;

    const ctxCalc = calcMapCanvas.getContext('2d');

    function setupCalcCanvas() {
        const parentWidth = calcMapCanvas.parentElement.clientWidth;
        const canvasSize = Math.min(parentWidth, window.innerHeight * 0.7, 600);
        calcMapCanvas.width = canvasSize; calcMapCanvas.height = canvasSize;
        calcMapCanvas.style.width = `${canvasSize}px`; calcMapCanvas.style.height = `${canvasSize}px`;
        currentZoomLevelCalcSpan.textContent = `View Range: ±${(mainPlaneLogicalExtentCalc / 2).toFixed(1)}`;
        drawCalcMap();
    }

    new ResizeObserver(() => { setupCalcCanvas(); }).observe(calcMapCanvas.parentElement);

    async function loadSavedMapsForCalc() {
        try {
            const response = await fetch('/api/list-groundmaps'); const result = await response.json();
            if (result.success) {
                savedMapsSelectCalc.innerHTML = '<option value="">-- 연산할 Map 선택 --</option>';
                result.files.forEach(fileName => { const option = document.createElement('option'); option.value = fileName; option.textContent = fileName.replace('.json', ''); savedMapsSelectCalc.appendChild(option); });
            } else { console.error('저장된 Map 목록 불러오기 실패 (연산):', result.message); }
        } catch (error) { console.error('Map 목록 API 호출 오류 (연산):', error); }
    }

    async function loadMapForCalculation() {
        const fileName = savedMapsSelectCalc.value; if (!fileName) { alert('연산할 GroundMap을 선택하세요.'); return; }
        try {
            const response = await fetch(`/api/load-groundmap/${fileName}`); const result = await response.json();
            if (result.success) {
                const loadedData = result.data;
                originalMapDataForCalc = JSON.parse(JSON.stringify(loadedData));
                originalMapDataForCalc.groundMapOriginX = 0;
                originalMapDataForCalc.groundMapOriginY = 0;
                originalMapDataForCalc.groundMapAxisX = { x: 1, y: 0 }; // Initialize axes for original data
                originalMapDataForCalc.groundMapAxisY = { x: 0, y: 1 };

                currentCalcMapData = {
                    mapName: loadedData.mapName,
                    sourcePlaneWidth: parseFloat(loadedData.planeWidth || loadedData.planeSize || 500),
                    sourcePlaneHeight: parseFloat(loadedData.planeHeight || loadedData.planeSize || (loadedData.planeWidth ? loadedData.planeWidth : 500)),
                    points: loadedData.points.map(p => ({ name: p.name, x: parseFloat(p.x), y: parseFloat(p.y) })),
                    groundMapOriginX: 0,
                    groundMapOriginY: 0,
                    groundMapAxisX: { x: 1, y: 0 }, // Reset axes
                    groundMapAxisY: { x: 0, y: 1 }
                };
                operationHistory = [];
                mainPlaneLogicalExtentCalc = 20;
                viewOffsetX_calc = 0; // Reset pan
                viewOffsetY_calc = 0;
                updatePointListCalc(); updateOperationHistoryList(); setupCalcCanvas();
                alert(`'${currentCalcMapData.mapName}'을(를) 연산용으로 불러왔습니다. GroundMap의 원점이 Main Plane의 (0,0)에 위치합니다.`);
            } else { alert(`GroundMap 불러오기 실패 (연산): ${result.message}`); }
        } catch (error) { console.error('불러오기 API 호출 오류 (연산):', error); alert('GroundMap 불러오기 중 오류가 발생했습니다 (연산).'); }
    }

    function updatePointListCalc() {
        pointListCalcUl.innerHTML = '';
        if (currentCalcMapData && currentCalcMapData.points) {
            currentCalcMapData.points.forEach(point => { const li = document.createElement('li'); li.textContent = `${point.name}: (${point.x.toFixed(2)}, ${point.y.toFixed(2)})`; pointListCalcUl.appendChild(li); });
        }
    }

    function drawCalcMap() {
        const canvasActualWidth = calcMapCanvas.width;
        const canvasActualHeight = calcMapCanvas.height;
        ctxCalc.clearRect(0, 0, canvasActualWidth, canvasActualHeight);

        const scale = canvasActualWidth / mainPlaneLogicalExtentCalc;

        // Visual center of the canvas
        const visualCenterX_canvas = canvasActualWidth / 2;
        const visualCenterY_canvas = canvasActualHeight / 2;

        // Canvas coordinates of the Main Plane's (0,0) after panning
        // (viewOffsetX_calc, viewOffsetY_calc) is the logical point at the visual center
        const mainPlaneOriginOnCanvasX = visualCenterX_canvas - viewOffsetX_calc * scale;
        const mainPlaneOriginOnCanvasY = visualCenterY_canvas + viewOffsetY_calc * scale; // Y flipped

        drawMainPlaneAxesAndGrid(ctxCalc, canvasActualWidth, canvasActualHeight, mainPlaneLogicalExtentCalc, scale, mainPlaneOriginOnCanvasX, mainPlaneOriginOnCanvasY, viewOffsetX_calc, viewOffsetY_calc);

        if (currentCalcMapData && currentCalcMapData.points) {
            // NEW: Draw GroundMap Rectangle
            const gmOx_main = currentCalcMapData.groundMapOriginX; // GM origin in Main Plane coords
            const gmOy_main = currentCalcMapData.groundMapOriginY;
            const srcW = currentCalcMapData.sourcePlaneWidth;
            const srcH = currentCalcMapData.sourcePlaneHeight;
            const axisX = currentCalcMapData.groundMapAxisX; // Normalized vector for GM's X-axis
            const axisY = currentCalcMapData.groundMapAxisY; // Normalized vector for GM's Y-axis

            // Calculate 4 corners of the GroundMap in Main Plane coordinates
            const c0_main = { x: gmOx_main, y: gmOy_main };
            const c1_main = { x: gmOx_main + srcW * axisX.x, y: gmOy_main + srcW * axisX.y };
            const c2_main = { x: gmOx_main + srcW * axisX.x + srcH * axisY.x, y: gmOy_main + srcW * axisX.y + srcH * axisY.y };
            const c3_main = { x: gmOx_main + srcH * axisY.x, y: gmOy_main + srcH * axisY.y };

            // Convert corners to canvas coordinates (incorporating pan and scale)
            const corners_canvas = [c0_main, c1_main, c2_main, c3_main].map(p_main => ({
                x: mainPlaneOriginOnCanvasX + p_main.x * scale,
                y: mainPlaneOriginOnCanvasY - p_main.y * scale
            }));

            ctxCalc.beginPath();
            ctxCalc.moveTo(corners_canvas[0].x, corners_canvas[0].y);
            ctxCalc.lineTo(corners_canvas[1].x, corners_canvas[1].y);
            ctxCalc.lineTo(corners_canvas[2].x, corners_canvas[2].y);
            ctxCalc.lineTo(corners_canvas[3].x, corners_canvas[3].y);
            ctxCalc.closePath();
            ctxCalc.strokeStyle = 'rgba(0, 128, 0, 0.6)'; // Green for GM boundary
            ctxCalc.lineWidth = 1.5;
            ctxCalc.stroke();


            // Draw points
            currentCalcMapData.points.forEach(point => {
                const canvasX = mainPlaneOriginOnCanvasX + point.x * scale;
                const canvasY = mainPlaneOriginOnCanvasY - point.y * scale;
                ctxCalc.beginPath(); ctxCalc.arc(canvasX, canvasY, 5, 0, Math.PI * 2); ctxCalc.fillStyle = 'red'; ctxCalc.fill();
                ctxCalc.fillStyle = 'black'; ctxCalc.font = '12px Arial';
                // ctxCalc.fillText(`${point.name}(${point.x.toFixed(2)},${point.y.toFixed(2)})`, canvasX + 8, canvasY - 8);
                ctxCalc.fillText(`${point.name}`, canvasX + 8, canvasY - 8);
            });

            // Draw GroundMap's origin marker (already relative to Main Plane)
            const gmOriginCanvasX = mainPlaneOriginOnCanvasX + gmOx_main * scale;
            const gmOriginCanvasY = mainPlaneOriginOnCanvasY - gmOy_main * scale;
            ctxCalc.beginPath(); ctxCalc.arc(gmOriginCanvasX, gmOriginCanvasY, 3, 0, Math.PI * 2); ctxCalc.fillStyle = 'rgba(0, 128, 0, 0.8)'; ctxCalc.fill();
            ctxCalc.fillText(`GM O(${gmOx_main.toFixed(1)}, ${gmOy_main.toFixed(1)})`, gmOriginCanvasX + 5, gmOriginCanvasY + 15);
        }
    }

    // Modified to accept mainPlaneOriginOnCanvasX/Y and viewOffset for correct grid label rendering
    function drawMainPlaneAxesAndGrid(ctx, width, height, logicalExtent, scale, mpOriginX_canvas, mpOriginY_canvas, viewOffsetX, viewOffsetY) {
        ctx.strokeStyle = '#e0e0e0'; ctx.lineWidth = 0.5;
        let logicalGridStep = 1;
        if (logicalExtent > 40) logicalGridStep = Math.ceil(logicalExtent / 20 / 5) * 5; // Dynamic step
        else if (logicalExtent > 20) logicalGridStep = 2;
        if (logicalGridStep === 0) logicalGridStep = 1;


        // Determine the logical range visible based on viewOffset and extent
        const logicalMinX = viewOffsetX - logicalExtent / 2;
        const logicalMaxX = viewOffsetX + logicalExtent / 2;
        const logicalMinY = viewOffsetY - logicalExtent / 2;
        const logicalMaxY = viewOffsetY + logicalExtent / 2;

        // Vertical grid lines
        let currentLogicalX = Math.ceil(logicalMinX / logicalGridStep) * logicalGridStep;
        while (currentLogicalX <= logicalMaxX) {
            const xCanvasPos = mpOriginX_canvas + (currentLogicalX) * scale;
            ctx.beginPath(); ctx.moveTo(xCanvasPos, 0); ctx.lineTo(xCanvasPos, height); ctx.stroke();
            currentLogicalX += logicalGridStep;
        }

        // Horizontal grid lines
        let currentLogicalY = Math.ceil(logicalMinY / logicalGridStep) * logicalGridStep;
        while (currentLogicalY <= logicalMaxY) {
            const yCanvasPos = mpOriginY_canvas - (currentLogicalY) * scale;
            ctx.beginPath(); ctx.moveTo(0, yCanvasPos); ctx.lineTo(width, yCanvasPos); ctx.stroke();
            currentLogicalY += logicalGridStep;
        }

        ctx.strokeStyle = '#555'; ctx.lineWidth = 1; // Main Axes color
        ctx.beginPath(); ctx.moveTo(mpOriginX_canvas, 0); ctx.lineTo(mpOriginX_canvas, height); ctx.stroke(); // Main Y-Axis line
        ctx.beginPath(); ctx.moveTo(0, mpOriginY_canvas); ctx.lineTo(width, mpOriginY_canvas); ctx.stroke(); // Main X-Axis line

        ctx.fillStyle = 'black'; ctx.font = '10px Arial';
        const tickLength = 5;
        const labelOffset = 10;

        // X-axis labels (adjusted for panning)
        currentLogicalX = Math.ceil(logicalMinX / logicalGridStep) * logicalGridStep;
        while (currentLogicalX <= logicalMaxX) {
             if (Math.abs(currentLogicalX) < logicalGridStep/2 && currentLogicalX !== 0) { // Avoid label overlap with Y axis if too close and not 0
                // Skip if it's very close to 0 but not 0 (0 is handled by origin label)
             } else {
                const xTickCanvasPos = mpOriginX_canvas + (currentLogicalX) * scale;
                ctx.beginPath(); ctx.moveTo(xTickCanvasPos, mpOriginY_canvas - tickLength); ctx.lineTo(xTickCanvasPos, mpOriginY_canvas + tickLength); ctx.stroke();
                if (currentLogicalX !== 0) {
                     ctx.fillText(currentLogicalX.toFixed(0), xTickCanvasPos - (currentLogicalX < 0 ? 8:4) , mpOriginY_canvas + tickLength + labelOffset);
                }
             }
            currentLogicalX += logicalGridStep;
        }

        // Y-axis labels (adjusted for panning)
        currentLogicalY = Math.ceil(logicalMinY / logicalGridStep) * logicalGridStep;
        while (currentLogicalY <= logicalMaxY) {
            if (Math.abs(currentLogicalY) < logicalGridStep/2 && currentLogicalY !== 0) {
                // Skip
            } else {
                const yTickCanvasPos = mpOriginY_canvas - (currentLogicalY) * scale;
                ctx.beginPath(); ctx.moveTo(mpOriginX_canvas - tickLength, yTickCanvasPos); ctx.lineTo(mpOriginX_canvas + tickLength, yTickCanvasPos); ctx.stroke();
                if (currentLogicalY !== 0) {
                    ctx.fillText(currentLogicalY.toFixed(0), mpOriginX_canvas + tickLength + 2, yTickCanvasPos + 3);
                }
            }
            currentLogicalY += logicalGridStep;
        }
        // Origin "0" label
        ctx.font = '12px Arial';
        ctx.fillText("0", mpOriginX_canvas - 10, mpOriginY_canvas + 15);
    }


    function addOperationToHistory(type, params, pointsBefore, originBefore, axisXBefore, axisYBefore) {
        operationHistory.push({
            type, params,
            pointsBefore: JSON.parse(JSON.stringify(pointsBefore)),
            originBefore: JSON.parse(JSON.stringify(originBefore)),
            axisXBefore: JSON.parse(JSON.stringify(axisXBefore)),
            axisYBefore: JSON.parse(JSON.stringify(axisYBefore))
        });
        updateOperationHistoryList();
    }

    function updateOperationHistoryList() {
        operationHistoryUl.innerHTML = '';
        operationHistory.forEach((op, index) => {
            const li = document.createElement('li');
            let desc = `${index + 1}. ${op.type}`;
            if (op.type === 'translate') desc += ` (dx: ${op.params.dx.toFixed(2)}, dy: ${op.params.dy.toFixed(2)})`;
            if (op.type === 'rotate') desc += ` (${op.params.angle.toFixed(2)}° around GM O(${op.originBefore.x.toFixed(2)}, ${op.originBefore.y.toFixed(2)}))`;
            if (op.type === 'reflect') desc += ` (y=x)`;
            li.textContent = desc;
            operationHistoryUl.appendChild(li);
        });
        operationHistoryUl.scrollTop = operationHistoryUl.scrollHeight;
    }

    function applyTranslation() {
        if (!currentCalcMapData || !currentCalcMapData.points || currentCalcMapData.points.length === 0) { alert('먼저 GroundMap을 불러오고 점이 있는지 확인하세요.'); return; }
        const dx = parseFloat(translateXInput.value); const dy = parseFloat(translateYInput.value);
        if (isNaN(dx) || isNaN(dy)) { alert('유효한 숫자 형식의 이동값을 입력하세요.'); return; }

        addOperationToHistory('translate', { dx, dy }, currentCalcMapData.points,
            {x: currentCalcMapData.groundMapOriginX, y: currentCalcMapData.groundMapOriginY},
            currentCalcMapData.groundMapAxisX, currentCalcMapData.groundMapAxisY);

        currentCalcMapData.points.forEach(point => { point.x += dx; point.y += dy; });
        currentCalcMapData.groundMapOriginX += dx;
        currentCalcMapData.groundMapOriginY += dy;
        // Axes orientation doesn't change with translation
        updateAndDrawCalc();
        translateXInput.value = 0; translateYInput.value = 0;
    }

    function applyRotation() {
        if (!currentCalcMapData || !currentCalcMapData.points || currentCalcMapData.points.length === 0) { alert('먼저 GroundMap을 불러오고 점이 있는지 확인하세요.'); return; }
        const angleDeg = parseFloat(rotateAngleInput.value);
        if (isNaN(angleDeg)) { alert('유효한 숫자 형식의 회전 각도를 입력하세요.'); return; }

        const gmOx = currentCalcMapData.groundMapOriginX;
        const gmOy = currentCalcMapData.groundMapOriginY;

        addOperationToHistory('rotate', { angle: angleDeg }, currentCalcMapData.points,
            {x: gmOx, y: gmOy},
            currentCalcMapData.groundMapAxisX, currentCalcMapData.groundMapAxisY);

        const angleRad = angleDeg * (Math.PI / 180); // Clockwise for positive angle
        const cosA = Math.cos(angleRad);
        const sinA = Math.sin(angleRad);

        currentCalcMapData.points.forEach(point => {
            const relX = point.x - gmOx; const relY = point.y - gmOy;
            const rotatedRelX = relX * cosA + relY * sinA;
            const rotatedRelY = -relX * sinA + relY * cosA;
            point.x = gmOx + rotatedRelX; point.y = gmOy + rotatedRelY;
        });

        // Rotate GroundMap's axes
        const ax = currentCalcMapData.groundMapAxisX;
        const ay = currentCalcMapData.groundMapAxisY;
        currentCalcMapData.groundMapAxisX = { x: ax.x * cosA + ax.y * sinA, y: -ax.x * sinA + ax.y * cosA };
        currentCalcMapData.groundMapAxisY = { x: ay.x * cosA + ay.y * sinA, y: -ay.x * sinA + ay.y * cosA };

        updateAndDrawCalc();
        rotateAngleInput.value = 0;
    }

    function applyReflection() { // y=x reflection
        if (!currentCalcMapData || !currentCalcMapData.points || currentCalcMapData.points.length === 0) { alert('먼저 GroundMap을 불러오고 점이 있는지 확인하세요.'); return; }

        addOperationToHistory('reflect', {}, currentCalcMapData.points,
            {x: currentCalcMapData.groundMapOriginX, y: currentCalcMapData.groundMapOriginY},
            currentCalcMapData.groundMapAxisX, currentCalcMapData.groundMapAxisY);

        currentCalcMapData.points.forEach(point => { const tempX = point.x; point.x = point.y; point.y = tempX; });

        const tempOriginX = currentCalcMapData.groundMapOriginX;
        currentCalcMapData.groundMapOriginX = currentCalcMapData.groundMapOriginY;
        currentCalcMapData.groundMapOriginY = tempOriginX;

        // Reflect GroundMap's axes
        const ax = currentCalcMapData.groundMapAxisX;
        const ay = currentCalcMapData.groundMapAxisY;
        currentCalcMapData.groundMapAxisX = { x: ay.x, y: ay.y }; // Old Y-axis becomes new X-axis
        currentCalcMapData.groundMapAxisY = { x: ax.x, y: ax.y }; // Old X-axis becomes new Y-axis
        // This is for y=x reflection. If original was (1,0) (0,1), it becomes (0,1) (1,0)

        updateAndDrawCalc();
    }

    function resetOperations() {
        if (!originalMapDataForCalc || !originalMapDataForCalc.points) { alert('먼저 GroundMap을 불러오세요.'); return; }
        currentCalcMapData.points = JSON.parse(JSON.stringify(originalMapDataForCalc.points));
        currentCalcMapData.groundMapOriginX = originalMapDataForCalc.groundMapOriginX !== undefined ? originalMapDataForCalc.groundMapOriginX : 0;
        currentCalcMapData.groundMapOriginY = originalMapDataForCalc.groundMapOriginY !== undefined ? originalMapDataForCalc.groundMapOriginY : 0;
        currentCalcMapData.groundMapAxisX = originalMapDataForCalc.groundMapAxisX ? JSON.parse(JSON.stringify(originalMapDataForCalc.groundMapAxisX)) : { x: 1, y: 0 };
        currentCalcMapData.groundMapAxisY = originalMapDataForCalc.groundMapAxisY ? JSON.parse(JSON.stringify(originalMapDataForCalc.groundMapAxisY)) : { x: 0, y: 1 };

        currentCalcMapData.mapName = originalMapDataForCalc.mapName;
        currentCalcMapData.sourcePlaneWidth = parseFloat(originalMapDataForCalc.planeWidth || originalMapDataForCalc.planeSize || 500);
        currentCalcMapData.sourcePlaneHeight = parseFloat(originalMapDataForCalc.planeHeight || originalMapDataForCalc.planeSize || (originalMapDataForCalc.planeWidth ? originalMapDataForCalc.planeWidth : 500));

        operationHistory = [];
        mainPlaneLogicalExtentCalc = 20;
        viewOffsetX_calc = 0; // Reset pan
        viewOffsetY_calc = 0;
        updateAndDrawCalc(); updateOperationHistoryList();
        currentZoomLevelCalcSpan.textContent = `View Range: ±${(mainPlaneLogicalExtentCalc / 2).toFixed(1)}`;
        alert('모든 연산, 줌 및 화면 이동이 초기화되었습니다.');
    }

    function undoLastOperation() {
        if (operationHistory.length === 0) { alert('되돌릴 연산이 없습니다.'); return; }
        const lastOp = operationHistory.pop();
        currentCalcMapData.points = JSON.parse(JSON.stringify(lastOp.pointsBefore));
        if (lastOp.originBefore) {
            currentCalcMapData.groundMapOriginX = lastOp.originBefore.x;
            currentCalcMapData.groundMapOriginY = lastOp.originBefore.y;
        }
        if (lastOp.axisXBefore && lastOp.axisYBefore) {
            currentCalcMapData.groundMapAxisX = JSON.parse(JSON.stringify(lastOp.axisXBefore));
            currentCalcMapData.groundMapAxisY = JSON.parse(JSON.stringify(lastOp.axisYBefore));
        }
        updateAndDrawCalc(); updateOperationHistoryList();
    }

    function updateAndDrawCalc() { updatePointListCalc(); drawCalcMap(); }

    function zoomInCalcCanvas() {
        mainPlaneLogicalExtentCalc = Math.max(2, mainPlaneLogicalExtentCalc - 2);
        currentZoomLevelCalcSpan.textContent = `View Range: ±${(mainPlaneLogicalExtentCalc / 2).toFixed(1)}`;
        drawCalcMap();
    }

    function zoomOutCalcCanvas() {
        mainPlaneLogicalExtentCalc = Math.min(500, mainPlaneLogicalExtentCalc + 2); // Added a max zoom out limit
        currentZoomLevelCalcSpan.textContent = `View Range: ±${(mainPlaneLogicalExtentCalc / 2).toFixed(1)}`;
        drawCalcMap();
    }

    // NEW: Panning event handlers
    calcMapCanvas.addEventListener('mousedown', (e) => {
        if (e.button !== 0) return; // Only left click
        isPanningCalc = true;
        lastPanX_canvas = e.offsetX;
        lastPanY_canvas = e.offsetY;
        calcMapCanvas.style.cursor = 'grabbing';
    });

    calcMapCanvas.addEventListener('mousemove', (e) => {
        if (!isPanningCalc) return;
        const currentX_canvas = e.offsetX;
        const currentY_canvas = e.offsetY;

        const dx_canvas = currentX_canvas - lastPanX_canvas;
        const dy_canvas = currentY_canvas - lastPanY_canvas;

        const scale = calcMapCanvas.width / mainPlaneLogicalExtentCalc;
        if (scale === 0) return; // Avoid division by zero if canvas not ready

        // Convert canvas pixel delta to logical unit delta
        const dx_logical = dx_canvas / scale;
        const dy_logical = dy_canvas / scale;

        // Update view offset (Y is flipped in logical vs canvas)
        viewOffsetX_calc -= dx_logical;
        viewOffsetY_calc += dy_logical;

        lastPanX_canvas = currentX_canvas;
        lastPanY_canvas = currentY_canvas;

        drawCalcMap();
    });

    calcMapCanvas.addEventListener('mouseup', () => {
        if (isPanningCalc) {
            isPanningCalc = false;
            calcMapCanvas.style.cursor = 'grab';
        }
    });

    calcMapCanvas.addEventListener('mouseleave', () => {
        if (isPanningCalc) {
            isPanningCalc = false;
            calcMapCanvas.style.cursor = 'default'; // Or 'grab' if you want to keep it
        }
    });
    // Set initial cursor for panning
    calcMapCanvas.style.cursor = 'grab';


    function exportCalcResultToJson() {
        if (!currentCalcMapData || !currentCalcMapData.points || currentCalcMapData.points.length === 0) { alert('내보낼 데이터가 없습니다.'); return; }
        const dataToExport = {
            mapName: `${currentCalcMapData.mapName}_calculated_MainPlaneCoords`,
            originalPlaneInfo: { width: currentCalcMapData.sourcePlaneWidth, height: currentCalcMapData.sourcePlaneHeight, originalOriginOnMainPlane: originalMapDataForCalc ? { x: originalMapDataForCalc.groundMapOriginX, y: originalMapDataForCalc.groundMapOriginY } : {x:0, y:0} },
            currentGroundMapOriginOnMainPlane: { x: parseFloat(currentCalcMapData.groundMapOriginX.toFixed(3)), y: parseFloat(currentCalcMapData.groundMapOriginY.toFixed(3)) },
            currentGroundMapOrientation: { axisX: currentCalcMapData.groundMapAxisX, axisY: currentCalcMapData.groundMapAxisY },
            pointsOnMainPlane: currentCalcMapData.points.map(p => ({ name: p.name, x: parseFloat(p.x.toFixed(3)), y: parseFloat(p.y.toFixed(3)) })),
        };
        const dataStr = JSON.stringify(dataToExport, null, 2); const blob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url;
        const fileName = (currentCalcMapData.mapName.replace(/[^a-z0-9_\-]/gi, '_') || 'CalculatedMap') + `_MainCoords_${Date.now()}.json`;
        a.download = fileName; document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
        alert(`'${fileName}' 파일이 다운로드됩니다. 점 좌표는 Main Plane 기준입니다.`);
    }

    function exportCalcResultToCsv() {
        if (!currentCalcMapData || !currentCalcMapData.points || currentCalcMapData.points.length === 0) { alert('내보낼 데이터가 없습니다.'); return; }
        let csvContent = `GroundMapName,"${currentCalcMapData.mapName}_calculated_MainPlaneCoords"\n`;
        csvContent += `CurrentGroundMapOriginX_OnMainPlane,${currentCalcMapData.groundMapOriginX.toFixed(3)}\n`;
        csvContent += `CurrentGroundMapOriginY_OnMainPlane,${currentCalcMapData.groundMapOriginY.toFixed(3)}\n`;
        csvContent += `CurrentGroundMapAxisX_x,${currentCalcMapData.groundMapAxisX.x.toFixed(3)}\n`;
        csvContent += `CurrentGroundMapAxisX_y,${currentCalcMapData.groundMapAxisX.y.toFixed(3)}\n`;
        csvContent += `CurrentGroundMapAxisY_x,${currentCalcMapData.groundMapAxisY.x.toFixed(3)}\n`;
        csvContent += `CurrentGroundMapAxisY_y,${currentCalcMapData.groundMapAxisY.y.toFixed(3)}\n`;
        csvContent += "PointName,X_OnMainPlane,Y_OnMainPlane\n";
        currentCalcMapData.points.forEach(point => { csvContent += `${point.name},${point.x.toFixed(3)},${point.y.toFixed(3)}\n`; });
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' }); const url = URL.createObjectURL(blob);
        const a = document.createElement('a'); a.href = url;
        const fileName = (currentCalcMapData.mapName.replace(/[^a-z0-9_\-]/gi, '_') || 'CalculatedMap') + `_MainCoords_${Date.now()}.csv`;
        a.download = fileName; document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
        alert(`'${fileName}' 파일이 다운로드됩니다. 점 좌표는 Main Plane 기준입니다.`);
    }

    btnLoadMapForCalc.addEventListener('click', loadMapForCalculation);
    btnTranslate.addEventListener('click', applyTranslation);
    btnRotate.addEventListener('click', applyRotation);
    btnReflect.addEventListener('click', applyReflection);
    btnResetOperations.addEventListener('click', resetOperations);
    btnUndoOperation.addEventListener('click', undoLastOperation);
    btnExportJson.addEventListener('click', exportCalcResultToJson);
    btnExportCsv.addEventListener('click', exportCalcResultToCsv);
    btnZoomInCalc.addEventListener('click', zoomInCalcCanvas);
    btnZoomOutCalc.addEventListener('click', zoomOutCalcCanvas);

    showPage(createPage, btnShowCreatePage);
    initializeCreateMap();
    loadSavedMapsForCreate();
    loadSavedMapsForCalc();
    setupCalcCanvas();
});