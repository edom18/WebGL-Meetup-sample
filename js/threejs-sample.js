(function () {

    'use strict';

    var scene, camera, renderer;
    var geometry, material, meshs = [], light;

    /**
     * 初期化関数
     */
    function init() {

        // シーンの作成
        scene = new THREE.Scene();

        // カメラの作成（パースペクティブカメラ）
        camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 10000);
        camera.position.set(0, 500, 1000);
        camera.rotation.x = -0.5;

        // ジオメトリ（形状）を生成
        geometry = new THREE.BoxGeometry(200, 200, 200);

        // マテリアル（材質）を生成
        material = new THREE.MeshPhongMaterial({
            color: 0xff0000,   // 材質の色
            specular: 0x222222 // 反射の色
        });

        // 形状をと材質を元にオブジェクトを生成
        var mesh = new THREE.Mesh(geometry, material);

        // 生成したオブジェクトをシーンに追加
        scene.add(mesh);
        meshs.push(mesh);

        // 生成したオブジェクトを複製
        var mesh2 = mesh.clone();
        mesh2.position.x = 300;

        // 複製したオブジェクトをシーンに追加
        scene.add(mesh2);
        meshs.push(mesh2);

        // 平行光源を生成
        light = new THREE.DirectionalLight(0xffffff, 3);
        light.position.set(-50, 200, 50);

        // 平行光源をシーンに追加
        scene.add(light);

        // WebGL用レンダラーを生成
        renderer = new THREE.WebGLRenderer();
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setClearColor(0x333333);

        // レンダラー用canvasをbody要素に追加
        document.body.appendChild(renderer.domElement);
    }


    /**
     * アニメーション関数
     */
    function animate() {
        requestAnimationFrame(animate);

        meshs.forEach(function (mesh, i) {
            mesh.rotation.x += 0.01 + i / 100;
            mesh.rotation.y += 0.02 + i / 100;
        });

        renderer.render(scene, camera);
    }

    init();
    animate();

}());
