const gulp = require("gulp");
const sass = require("gulp-sass")(require("sass"));
const postcss = require("gulp-postcss");
const autoprefixer = require("autoprefixer");
const cssSorter = require("css-declaration-sorter");
const mmq = require("gulp-merge-media-queries");

const browserSync = require("browser-sync");

const cleanCss = require("gulp-clean-css");
const uglify = require("gulp-uglify");
const rename = require("gulp-rename");

const htmlBeautify = require("gulp-html-beautify");

function compileSass() {
  return (
    gulp
      .src("./src/assets/sass/**/*.scss") //元データ
      //コンパイルの処理を記載する
      .pipe(sass()) //sass->cssのコンパイル
      .pipe(postcss([autoprefixer(), cssSorter({ outputStyle: "compressed" })])) //autoprefixer, css序列の設定
      .pipe(mmq()) //メディアクエリの一括化
      .pipe(gulp.dest("./public/assets/css")) //出力先
      .pipe(cleanCss()) //CSSの圧縮
      .pipe(
        rename({
          //ファイルのリネーム
          suffix: ".min",
        })
      )
      .pipe(gulp.dest("./public/assets/css"))
  ); //出力先
}

function watch() {
  //ファイル編集の監視⇒変更反映時にリロード
  gulp.watch("./src/assets/sass/**/*.scss", gulp.series(compileSass, browserReload)); //seriesルール：左から順番に実行
  gulp.watch("./src/assets/js/**/*.js", gulp.series(minJS, browserReload));
  gulp.watch("./src/assets/img/**/*", gulp.series(copyImage, browserReload));
  gulp.watch("./src/**/*.html", gulp.series(formatHTML, createScss, browserReload)); //FLOCSSのときはONにする。
}

function browserInit(done) {
  //ローカルサーバー立ち上げ
  browserSync.init({
    server: {
      baseDir: "./public", //ローカルサーバーが立ち上がったときに参照するファイル
    },
  });
  done();
}

function browserReload(done) {
  //自動リロード
  browserSync.reload();
  done();
}

function minJS() {
  return gulp
    .src("./src/assets/js/**/*.js") //元ファイル
    .pipe(gulp.dest("./public/assets/js")) //ファイル出力（そのまま出力）
    .pipe(uglify()) //jsの圧縮
    .pipe(
      rename({
        //ファイルリネーム
        suffix: ".min", //拡張子の変更
      })
    )
    .pipe(gulp.dest("./public/assets/js")); //ファイル出力
}

function formatHTML() {
  return gulp
    .src("./src/**/*.html") //元ファイル
    .pipe(
      htmlBeautify({
        //htmlフォーマット変更
        indent_size: 2,
        indent_with_tabs: true,
      })
    )
    .pipe(gulp.dest("./public"));
}

function copyImage() {
  //imgフォルダのコピー
  return (
    gulp
      .src("./src/assets/img/**/*")
      //
      .pipe(gulp.dest("./public/assets/img"))
  );
}

//-------------------------------------
// FLOCCS_SCSS作製ツール
//-------------------------------------
const cheerio = require("gulp-cheerio"); //gulp-cheerioのインストール必要
const fs = require("fs");
const path = require("path");

function createScss() {
  return gulp
    .src("./src/**/*.html") // 'src' ディレクトリ内の HTML ファイルを対象に設定
    .pipe(
      cheerio(function ($) {
        // 各フォルダの _index.scss ファイルのパス
        const layoutIndexScssPath = "./src/assets/sass/layout/_index.scss";
        const projectIndexScssPath = "./src/assets/sass/project/_index.scss";
        const componentIndexScssPath = "./src/assets/sass/component/_index.scss";
        // 各フォルダの _index.scss の内容を読み込む
        let layoutIndexScssContent = fs.existsSync(layoutIndexScssPath) ? fs.readFileSync(layoutIndexScssPath, "utf8") : "";
        let projectIndexScssContent = fs.existsSync(projectIndexScssPath) ? fs.readFileSync(projectIndexScssPath, "utf8") : "";
        let componentIndexScssContent = fs.existsSync(componentIndexScssPath) ? fs.readFileSync(componentIndexScssPath, "utf8") : "";

        $("*[class]").each(function () {
          // HTML の要素からクラス名を取得
          const classes = $(this).attr("class").split(/\s+/);

          classes.forEach(function (className) {
            let targetPath, indexScssContent;

            const baseClassName = className.split("__")[0]; // '__' が含まれている場合、それより前の部分を取得
            const scssClassName = `_${baseClassName}`; // SCSS ファイル名

            // クラス名の先頭文字に基づいて対応するフォルダと _index.scss の内容を選択
            if (className.startsWith("l")) {
              targetPath = "./src/assets/sass/layout";
              indexScssContent = layoutIndexScssContent;
            } else if (className.startsWith("p")) {
              targetPath = "./src/assets/sass/project";
              indexScssContent = projectIndexScssContent;
            } else if (className.startsWith("c")) {
              targetPath = "./src/assets/sass/component";
              indexScssContent = componentIndexScssContent;
            } else {
              return; // その他のクラス名は無視
            }
            const scssFilePath = path.join(targetPath, scssClassName + ".scss"); // 対応する SCSS ファイルのパスを生成

            if (!fs.existsSync(scssFilePath)) {
              fs.writeFileSync(scssFilePath, `@use "../global" as *;\n\n.${baseClassName} {\n // スタイルをここに記述\n}`); // SCSS ファイルが存在しない場合に新規作成
              indexScssContent += `@use "${baseClassName}";\n`; // 対応する _index.scss に新しい @use ステートメントを追加
            }
            // 更新された内容で _index.scss ファイルを書き込む
            if (className.startsWith("l")) {
              layoutIndexScssContent = indexScssContent;
            } else if (className.startsWith("p")) {
              projectIndexScssContent = indexScssContent;
            } else if (className.startsWith("c")) {
              componentIndexScssContent = indexScssContent;
            }
          });
        });

        fs.writeFileSync(layoutIndexScssPath, layoutIndexScssContent); // layout の _index.scss を更新
        fs.writeFileSync(projectIndexScssPath, projectIndexScssContent); // project の _index.scss を更新
        fs.writeFileSync(componentIndexScssPath, componentIndexScssContent); // component の _index.scss を更新
      })
    );
}

exports.createScss = createScss;

exports.compileSass = compileSass;
exports.watch = watch;
exports.browserInit = browserInit;
exports.minJS = minJS;
exports.formatHTML = formatHTML;
exports.build = gulp.parallel(formatHTML, minJS, compileSass, copyImage);
exports.dev = gulp.parallel(browserInit, watch); //並行（順不同）して同時実行する記述
