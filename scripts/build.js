// MOD日本語化パック自動変換スクリプト（スマートビルド対応）
// 使い方: 
//   npm run build              - 変更されたファイルのみビルド
//   npm run build -- --force   - すべて強制的にビルド

const fs = require('fs');
const path = require('path');
const archiver = require('archiver');

// バージョン設定
const VERSION_CONFIG = {
    '1.20.1': { pack_format: 15 },
    '1.18.2': { pack_format: 9 }
};

// コマンドライン引数の解析
const args = process.argv.slice(2);
const targetVersion = args.find(arg => !arg.startsWith('--'));
const forceRebuild = args.includes('--force');

const versions = targetVersion ? [targetVersion] : Object.keys(VERSION_CONFIG);

console.log('🚀 MOD日本語化パック自動ビルド開始...');
if (forceRebuild) {
    console.log('⚡ 強制再ビルドモード\n');
} else {
    console.log('📋 スマートビルドモード（変更されたファイルのみ）\n');
}

let totalBuilt = 0;
let totalSkipped = 0;
let totalFailed = 0;
const failedMods = [];

// 各バージョンを処理
versions.forEach(version => {
    console.log(`📦 ${version} の処理中...`);

    const sourceDir = path.join('data', 'source', version);
    const outputDir = path.join('downloads', version);

    // ディレクトリチェック
    if (!fs.existsSync(sourceDir)) {
        console.log(`   ⚠️  ソースディレクトリが見つかりません: ${sourceDir}`);
        console.log(`   スキップします\n`);
        return;
    }

    // 出力ディレクトリが無ければ作成
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }

    // ソースディレクトリ内の.jsonファイルを取得
    const files = fs.readdirSync(sourceDir).filter(f => f.endsWith('.json'));

    if (files.length === 0) {
        console.log(`   ⚠️  .jsonファイルが見つかりません\n`);
        return;
    }

    console.log(`   ${files.length}個のMODを処理します`);

    let built = 0;
    let skipped = 0;
    let failed = 0;

    files.forEach(file => {
        // ファイル名から MOD ID を抽出
        const modId = extractModId(file);

        if (!modId) {
            console.log(`   ⚠️  MOD IDを抽出できませんでした: ${file}`);
            failed++;
            failedMods.push({ version, file, reason: 'MOD ID抽出失敗' });
            return;
        }

        const jsonPath = path.join(sourceDir, file);
        const zipPath = path.join(outputDir, `${modId}-ja-${version}.zip`);

        // スマートビルド: 更新チェック
        if (!forceRebuild && shouldSkipBuild(jsonPath, zipPath)) {
            skipped++;
            return;
        }

        const success = buildPack(modId, file, version, sourceDir, outputDir);

        if (success) {
            built++;
        } else {
            failed++;
            failedMods.push({ version, file, reason: 'ビルド失敗' });
        }
    });

    console.log(`   ✅ ${built}個ビルド | ⏭️  ${skipped}個スキップ${failed > 0 ? ` | ❌ ${failed}個失敗` : ''}\n`);

    totalBuilt += built;
    totalSkipped += skipped;
    totalFailed += failed;
});

console.log(`\n🎉 完了！`);
console.log(`   ✅ ${totalBuilt}個のパックをビルド`);
if (totalSkipped > 0) {
    console.log(`   ⏭️  ${totalSkipped}個のパックをスキップ（変更なし）`);
}

if (totalFailed > 0) {
    console.log(`\n⚠️  ${totalFailed}個のパックで問題が発生しました:`);
    failedMods.forEach(mod => {
        console.log(`   - ${mod.version}/${mod.file}: ${mod.reason}`);
    });
}

/**
 * ビルドをスキップすべきかチェック
 */
function shouldSkipBuild(jsonPath, zipPath) {
    // zipファイルが存在しない → ビルド必要
    if (!fs.existsSync(zipPath)) {
        return false;
    }

    // 更新日時を比較
    const jsonStat = fs.statSync(jsonPath);
    const zipStat = fs.statSync(zipPath);

    // .jsonが.zipより新しい → ビルド必要
    // .jsonが.zipより古い or 同じ → スキップ
    return jsonStat.mtime <= zipStat.mtime;
}

/**
 * ファイル名からMOD IDを抽出
 */
function extractModId(filename) {
    // " ja_jp.json" を削除
    const modId = filename.replace(/\s+ja_jp\.json$/i, '');

    // 空文字列やスペースのみの場合はnull
    if (!modId || modId.trim() === '') {
        return null;
    }

    return modId.trim().toLowerCase();
}

/**
 * 個別のパックをビルド
 */
function buildPack(modId, originalFileName, version, sourceDir, outputDir) {
    try {
        const jsonPath = path.join(sourceDir, originalFileName);
        const zipPath = path.join(outputDir, `${modId}-ja-${version}.zip`);

        // jsonファイルの読み込み
        const langData = fs.readFileSync(jsonPath, 'utf8');

        // JSONが正しいか検証
        try {
            JSON.parse(langData);
        } catch (e) {
            console.error(`   ❌ ${modId}: 不正なJSON形式`);
            return false;
        }

        // pack.mcmetaの生成
        const packMeta = {
            pack: {
                pack_format: VERSION_CONFIG[version].pack_format,
                description: `${modId} Japanese Translation for ${version}`
            }
        };

        // README.mdの生成
        const readme = generateReadme(modId, version);

        // zipファイルの作成
        const output = fs.createWriteStream(zipPath);
        const archive = archiver('zip', { zlib: { level: 9 } });

        let resolved = false;

        output.on('close', () => {
            if (!resolved) {
                resolved = true;
                const sizeKB = (archive.pointer() / 1024).toFixed(1);
                console.log(`   ✓ ${modId} (${sizeKB}KB)`);
            }
        });

        archive.on('error', (err) => {
            if (!resolved) {
                resolved = true;
                console.error(`   ❌ ${modId}: ${err.message}`);
            }
        });

        archive.pipe(output);

        // ファイル構造を追加
        archive.append(langData, {
            name: `assets/${modId}/lang/ja_jp.json`
        });

        archive.append(JSON.stringify(packMeta, null, 2), {
            name: 'pack.mcmeta'
        });

        archive.append(readme, {
            name: 'README.md'
        });

        archive.finalize();

        return true;

    } catch (error) {
        console.error(`   ❌ ${modId}: ${error.message}`);
        return false;
    }
}

/**
 * README.md生成
 */
function generateReadme(modId, version) {
    const buildDate = new Date().toLocaleDateString('ja-JP');

    return `# ${modId} 日本語化パック

## 対応バージョン
- Minecraft: ${version}
- MOD ID: ${modId}

## 導入方法
1. このzipファイルをMinecraftの「リソースパック」フォルダに入れる
   - Windowsの場合: %appdata%\\.minecraft\\resourcepacks
   - Macの場合: ~/Library/Application Support/minecraft/resourcepacks
2. Minecraftを起動し、「設定」→「リソースパック」を開く
3. このパックを「使用中」に移動して適用

## ビルド情報
- ビルド日: ${buildDate}
- 配布元: https://ykpiece.github.io/minecraft-ja-packs/

## ライセンス
この翻訳は個人利用・配信・動画投稿すべてOKです。
再配布する場合は配布元へのリンクをお願いします。

## 問題報告
不具合や翻訳の改善提案は以下へお願いします：
https://github.com/ykpiece/minecraft-ja-packs/issues
`;
}