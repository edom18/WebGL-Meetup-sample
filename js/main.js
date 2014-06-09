/*!
 *
 * WebGLの基本的なセットアップと描画サンプル
 *
 * ごく単純な座標変換とシェーダのセットアップ、
 * レンダリングまでのミニマムなコードです。
 *
 */
(function () {

    'use strict';

    //////////////////////////////////////////////////////////////////////////////////////////////////
    // ヘルパー関数

    /**
     * シェーダを生成する
     *
     * @param {string} id DOMのID属性
     * 
     * @return {WebGLShader} 生成したシェーダオブジェクト
     */
    function create_shader(id) {

        var type_map = {
            'x-shader/x-vertex'  : gl.VERTEX_SHADER,
            'x-shader/x-fragment': gl.FRAGMENT_SHADER
        };

        var ele = document.getElementById(id);

        // DOMのtype属性から生成するシェーダの種類を決める
        var shader = gl.createShader(type_map[ele.type]);

        // 生成したシェーダに、DOM内のテキストをソースとして設定する
        gl.shaderSource(shader, ele.innerHTML);

        // シェーダをコンパイル
        gl.compileShader(shader);

        // もしシェーダのコンパイルにエラーがあった場合はそれを表示
        if (gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            return shader;
        }
        else {
            alert(gl.getShaderInfoLog(shader));
        }
    }

    /**
     * プログラムオブジェクトの生成
     *
     * @param {WebGLShader} vs 頂点シェーダ
     * @param {WebGLShader} fs フラグメントシェーダ
     *
     * @return {WebGLProgram} WebGLプログラムオブジェクト
     */
    function create_program(vs, fs) {
        
        // WebGLProgramオブジェクトを生成
        var program = gl.createProgram();

        // 引数で渡されたシェーダをアタッチ（頂点シェーダ→フラグメントシェーダの順）
        gl.attachShader(program, vs);
        gl.attachShader(program, fs);

        // ふたつのシェーダをリンクする
        gl.linkProgram(program);

        // もしリンクエラーがあった場合はそれを表示
        if (gl.getProgramParameter(program, gl.LINK_STATUS)) {
            gl.useProgram(program);
            return program;
        }
        else {
            alert(gl.getProgramInfoLog(program));
        }
    }

    /**
     * Vertex Buffer Object(VBO)を生成
     *
     * @param {Array} data 頂点データ
     *
     * @return {WebGLBuffer} 生成したバッファオブジェクト
     */
    function create_vbo (data) {
        // WebGLBufferオブジェクトを生成
        var vbo = gl.createBuffer();

        // バッファにデータをバインドする
        gl.bindBuffer(gl.ARRAY_BUFFER, vbo);

        // バインドしたバッファにデータを送る
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW);

        // バインドを解除する
        gl.bindBuffer(gl.ARRAY_BUFFER, null);

        return vbo;
    }

    /**
     * Index Buffer Object(IBO)を生成
     *
     * @param {Array} data インデックスデータ
     *
     * @return {WebGLBuffer} 生成したバッファオブジェクト
     */
    function create_ibo (data) {
        // WebGLBufferオブジェクトを生成
        var ibo = gl.createBuffer();

        // バッファにデータをバインドする
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo);

        // バインドしたバッファにデータを送る
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Int16Array(data), gl.STATIC_DRAW);

        // バインドを解除する
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

        return ibo;
    }


    //////////////////////////////////////////////////////////////////////////////////////////////////
    // WebGLのセットアップ

    var cv    = document.getElementById('canvas');
    cv.width  = window.innerWidth;
    cv.height = window.innerHeight;

    var gl = cv.getContext('webgl') || cv.getContext('experimental-webgl');

    // クリア時の色を指定する（RGBAで、0.0〜1.0を指定する）
    gl.clearColor(0.0, 0.0, 0.0, 1.0); // クリア時の色は黒

    // 深度バッファのクリア範囲を指定する
    gl.clearDepth(1.0);

    // クリアを実行
    // カラーと深度ふたつの情報をクリア
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);


    //////////////////////////////////////////////////////////////////////////////////////////////////
    // データの準備

    // 頂点の位置情報
    var position = [
        0.0, 1.0, 0.0,
       -1.0, 0.0, 0.0, 
        1.0, 0.0, 0.0
    ];

    // 頂点の色情報
    var color = [
        1.0, 0.0, 0.0, 1.0,
        0.0, 1.0, 0.0, 1.0,
        0.0, 0.0, 1.0, 1.0
    ];

    // 頂点のインデックス
    var index = [
        0, 1, 2
    ];

    // 頂点シェーダ、フラグメントシェーダを生成
    var vs = create_shader('vs');
    var fs = create_shader('fs');

    // 生成したシェーダからWebGLProgramオブジェクトを生成
    var program = create_program(vs, fs);

    // 頂点位置のVBOを生成
    var vertex_position = create_vbo(position);

    // 頂点色のVBOを生成
    var vertex_color = create_vbo(color);

    // IBOを生成
    var ibo = create_ibo(index);


    //////////////////////////////////////////////////////////////////////////////////////////////////
    // 座標変換パイプライン

    // マトリクス（行列）オブジェクトを生成
    var m = new matIV();

    // モデル行列用変数
    var model_matrix   = m.identity(m.create());

    // ビュー行列用変数
    var view_matrix   = m.identity(m.create());

    // プロジェクション行列用変数
    var projection_matrix   = m.identity(m.create());

    // MVP(Model View Projection)行列用変数
    var mvp_matrix = m.identity(m.create());

    // カメラの位置と注視点を設定
    m.lookAt([0.0, 0.0, 20.0], [0, 0, 0], [0, 1, 0], view_matrix);

    // パースペクティブを設定
    m.perspective(45, cv.width / cv.height, 0.1, 100, projection_matrix);

    // MVP行列を完成させる
    m.multiply(projection_matrix, view_matrix, mvp_matrix);
    m.multiply(mvp_matrix, model_matrix, mvp_matrix);


    //////////////////////////////////////////////////////////////////////////////////////////////////
    // シェーダの準備とデータのアップロード

    // 生成したプログラム（WebGLProgramオブジェクト）から、
    // 各種attribute変数のインデックス番号を取得
    var index_of_position = gl.getAttribLocation(program, 'position');
    var index_of_color    = gl.getAttribLocation(program, 'color');

    // 頂点位置をWebGLに通知
    var element_number_position = 3;
    gl.bindBuffer(gl.ARRAY_BUFFER, vertex_position);
    gl.enableVertexAttribArray(index_of_position);
    gl.vertexAttribPointer(index_of_position, element_number_position, gl.FLOAT, false, 0, 0);

    // 頂点色をWebGLに通知
    var element_number_color = 4;
    gl.bindBuffer(gl.ARRAY_BUFFER, vertex_color);
    gl.enableVertexAttribArray(index_of_color);
    gl.vertexAttribPointer(index_of_color, element_number_color, gl.FLOAT, false, 0, 0);

    // 頂点インデックスをWebGLに通知
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo);

    // 生成したプログラム（WebGLProgramオブジェクト）から、
    // 各種uniform変数のインデックス番号を取得
    var index_of_mvpMatrix = gl.getUniformLocation(program, 'mvpMatrix');

    // 取得したUniform変数へ、生成したMVP行列をアップロード
    gl.uniformMatrix4fv(index_of_mvpMatrix, false, mvp_matrix);


    //////////////////////////////////////////////////////////////////////////////////////////////////
    // レンダリング

    // 設定された情報を元にレンダリングを行う
    gl.drawElements(gl.TRIANGLES, index.length, gl.UNSIGNED_SHORT, 0);

}());
