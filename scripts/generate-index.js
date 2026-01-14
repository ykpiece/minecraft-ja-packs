// packs.json 自動生成スクリプト
// downloads/フォルダから全パック情報を収集してJSON化
// index.htmlのメタタグも自動更新

const fs = require('fs');
const path = require('path');

console.log('📋 パックインデックス生成中...\n');

// バージョン設定
const VERSIONS = ['1.20.1', '1.18.2'];
const DOWNLOADS_DIR = 'downloads';
const OUTPUT_FILE = 'data/packs.json';
const INDEX_HTML = 'index.html';

const allPacks = [];
let totalFiles = 0;

// 各バージョンを処理
VERSIONS.forEach(version => {
    const versionDir = path.join(DOWNLOADS_DIR, version);

    // ディレクトリが存在するかチェック
    if (!fs.existsSync(versionDir)) {
        console.log(`⚠️  ${version} のディレクトリが見つかりません: ${versionDir}`);
        return;
    }

    console.log(`📦 ${version} を処理中...`);

    // .zipファイルを取得
    const files = fs.readdirSync(versionDir).filter(f => f.endsWith('.zip'));

    if (files.length === 0) {
        console.log(`   ⚠️  zipファイルが見つかりません`);
        return;
    }

    let count = 0;

    files.forEach(file => {
        const filePath = path.join(versionDir, file);
        const stats = fs.statSync(filePath);
        
        const modId = file.replace(`-ja-${version}.zip`, '');
        
        // jsonファイルの日時を取得
        const sourceDir = path.join('source', version);
        const jsonPath = path.join(sourceDir, `${modId} ja_jp.json`);
        const jsonStats = fs.existsSync(jsonPath) ? fs.statSync(jsonPath) : stats;

        // パック情報を作成
        const packInfo = {
            id: `${modId}-${version.replace(/\./g, '')}`,
            modName: modId,
            displayName: getDisplayName(modId),
            modLoader: getModLoader(modId),
            mcVersion: version,
            fileName: file,
            downloadUrl: `downloads/${version}/${file}`,
            fileSize: formatFileSize(stats.size),
            fileSizeBytes: stats.size,
            lastUpdate: jsonStats.mtime.toISOString().split('T')[0]
        };

        allPacks.push(packInfo);
        count++;
    });

    console.log(`   ✅ ${count}個のパックを検出\n`);
    totalFiles += count;
});

// MOD名でソート（五十音順）
allPacks.sort((a, b) => a.displayName.localeCompare(b.displayName, 'ja'));

// バージョンごとの統計
const versionStats = {};
VERSIONS.forEach(version => {
    versionStats[version] = allPacks.filter(p => p.mcVersion === version).length;
});

// 出力データの構造
const output = {
    meta: {
        lastUpdate: new Date().toISOString().split('T')[0],
        totalPacks: allPacks.length,
        versions: VERSIONS,
        versionStats: versionStats,
        generatedBy: 'generate-index.js'
    },
    packs: allPacks
};

// data/ディレクトリが無ければ作成
if (!fs.existsSync('data')) {
    fs.mkdirSync('data');
}

// JSONファイルに保存
fs.writeFileSync(OUTPUT_FILE, JSON.stringify(output, null, 2), 'utf8');

console.log(`✅ ${totalFiles}個のパック情報を生成しました`);
console.log(`💾 ${OUTPUT_FILE} に保存しました`);
console.log(`\n統計:`);
Object.entries(versionStats).forEach(([version, count]) => {
    console.log(`   ${version}: ${count}個`);
});

// index.htmlのメタタグを更新
updateIndexHTML(totalFiles);

/**
 * index.htmlのメタタグを更新
 */
function updateIndexHTML(totalCount) {
    console.log('\n📝 index.html を更新中...');
    
    if (!fs.existsSync(INDEX_HTML)) {
        console.log(`⚠️  ${INDEX_HTML} が見つかりません`);
        return;
    }

    let html = fs.readFileSync(INDEX_HTML, 'utf8');
    
    // タイトルを更新
    html = html.replace(
        /<title[^>]*>.*?<\/title>/,
        `<title id="page-title">マイクラMOD 日本語化パック配布所 | ${totalCount}個のForge MOD対応 (1.20.1/1.18.2)</title>`
    );
    
    // メタディスクリプションを更新
    html = html.replace(
        /<meta name="description"[^>]*>/,
        `<meta name="description" id="page-description" content="Minecraft Forge MODの日本語化リソースパックを${totalCount}個配布中。Applied Energistics 2、beautify、Aquamiraeなど人気MODに対応。検索・フィルター機能付きで探しやすく、直接ダウンロード可能。">`
    );
    
    // OGP descriptionを更新
    html = html.replace(
        /<meta property="og:description"[^>]*>/,
        `<meta property="og:description" id="og-description" content="${totalCount}個のForge MOD日本語化パックを配布中。検索・フィルター機能付き。">`
    );
    
    // Twitter descriptionを更新
    html = html.replace(
        /<meta name="twitter:description"[^>]*>/,
        `<meta name="twitter:description" id="twitter-description" content="${totalCount}個のForge MOD日本語化パックを配布中">`
    );
    
    fs.writeFileSync(INDEX_HTML, html, 'utf8');
    console.log(`✅ ${INDEX_HTML} のメタタグを更新しました (${totalCount}個)`);
}

/**
 * ファイルサイズを人間が読みやすい形式に変換
 */
function formatFileSize(bytes) {
    if (bytes < 1024) {
        return bytes + 'B';
    } else if (bytes < 1024 * 1024) {
        return (bytes / 1024).toFixed(1) + 'KB';
    } else {
        return (bytes / (1024 * 1024)).toFixed(1) + 'MB';
    }
}

/**
 * MOD名を大文字始まりに変換
 * 例: "beautify" → "Beautify"
 * 例: "jei" → "JEI" (全て大文字の場合はそのまま)
 */
function capitalizeModName(modName) {
    // すでに大文字が含まれていればそのまま
    if (modName !== modName.toLowerCase()) {
        return modName;
    }

    // 3文字以下で全て小文字なら全て大文字に (jei → JEI)
    if (modName.length <= 3) {
        return modName.toUpperCase();
    }

    // それ以外は先頭だけ大文字 (beautify → Beautify)
    return modName.charAt(0).toUpperCase() + modName.slice(1);
}

/**
 * MOD名のマッピングを読み込んで表示名を取得
 */
function getDisplayName(modId) {
    try {
        if (fs.existsSync('data/mod-names.json')) {
            const mapping = JSON.parse(fs.readFileSync('data/mod-names.json', 'utf8'));
            if (mapping[modId]) {
                // 新形式（オブジェクト）の場合
                if (typeof mapping[modId] === 'object' && mapping[modId].name) {
                    return mapping[modId].name;
                }
                // 旧形式（文字列）の場合
                return mapping[modId];
            }
        }
    } catch (e) {
        // エラーは無視
    }
    
    return capitalizeModName(modId);
}

function getModLoader(modId) {
    try {
        if (fs.existsSync('data/mod-names.json')) {
            const mapping = JSON.parse(fs.readFileSync('data/mod-names.json', 'utf8'));
            // マッピングファイルにmodLoaderが指定されていればそれを使う
            if (mapping[modId] && mapping[modId].modLoader) {
                return mapping[modId].modLoader;
            }
        }
    } catch (e) {
        // エラーは無視
    }
    
    // デフォルトはForge
    return 'Forge';
}