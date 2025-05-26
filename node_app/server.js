// server.js

// 필요한 모듈들을 가져옵니다.
const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

// Express 애플리케이션을 생성합니다.
const app = express();
// 내부적으로 사용할 포트 번호를 3103으로 변경합니다.
const PORT = process.env.PORT || 3103;

// 미들웨어를 설정합니다.
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
}

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// --- API 엔드포인트 ---

// GroundMap 저장 API
app.post('/api/save-groundmap', (req, res) => {
    // planeSize 대신 planeWidth, planeHeight를 받음
    const { mapName, points, planeWidth, planeHeight } = req.body;
    if (!mapName || !points || planeWidth === undefined || planeHeight === undefined) {
        return res.status(400).json({ success: false, message: '잘못된 데이터입니다. mapName, points, planeWidth, planeHeight를 확인하세요.' });
    }
    if (isNaN(parseFloat(planeWidth)) || parseFloat(planeWidth) <= 0 || isNaN(parseFloat(planeHeight)) || parseFloat(planeHeight) <= 0) {
        return res.status(400).json({ success: false, message: '유효한 Plane 너비와 높이를 입력하세요.' });
    }


    const safeMapName = mapName.replace(/[^a-z0-9_\-]/gi, '_');
    const filePath = path.join(dataDir, `${safeMapName}.json`);
    const dataToSave = {
        mapName: mapName,
        planeWidth: parseFloat(planeWidth), // 실수로 저장
        planeHeight: parseFloat(planeHeight), // 실수로 저장
        points: points
    };

    fs.writeFile(filePath, JSON.stringify(dataToSave, null, 2), (err) => {
        if (err) {
            console.error('GroundMap 저장 실패:', err);
            return res.status(500).json({ success: false, message: 'GroundMap 저장에 실패했습니다.' });
        }
        res.json({ success: true, message: 'GroundMap이 성공적으로 저장되었습니다.', fileName: `${safeMapName}.json` });
    });
});

// GroundMap 불러오기 API (변경 없음, 클라이언트가 planeWidth/Height 또는 planeSize를 처리)
app.get('/api/load-groundmap/:fileName', (req, res) => {
    const fileName = req.params.fileName;
    if (fileName.includes('..') || fileName.includes('/')) {
        return res.status(400).json({ success: false, message: '잘못된 파일 이름입니다.' });
    }
    const filePath = path.join(dataDir, fileName);

    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            if (err.code === 'ENOENT') {
                return res.status(404).json({ success: false, message: 'GroundMap 파일을 찾을 수 없습니다.' });
            }
            console.error('GroundMap 불러오기 실패:', err);
            return res.status(500).json({ success: false, message: 'GroundMap 불러오기에 실패했습니다.' });
        }
        try {
            const jsonData = JSON.parse(data);
            res.json({ success: true, data: jsonData });
        } catch (parseError) {
            console.error('GroundMap JSON 파싱 실패:', parseError);
            return res.status(500).json({ success: false, message: 'GroundMap 데이터 파싱에 실패했습니다.' });
        }
    });
});

// 저장된 GroundMap 목록 불러오기 API (변경 없음)
app.get('/api/list-groundmaps', (req, res) => {
    fs.readdir(dataDir, (err, files) => {
        if (err) {
            console.error('GroundMap 목록 불러오기 실패:', err);
            return res.status(500).json({ success: false, message: '저장된 GroundMap 목록을 불러오는데 실패했습니다.' });
        }
        const jsonFiles = files.filter(file => file.endsWith('.json'));
        res.json({ success: true, files: jsonFiles });
    });
});

app.listen(PORT, () => {
    console.log(`서버가 http://localhost:${PORT} 에서 실행 중입니다.`);
    console.log(`Docker 환경에서는 호스트의 http://localhost:45315 로 접속하세요.`);
});
