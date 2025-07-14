document.getElementById('calcForm').addEventListener('submit', function (e) {
    e.preventDefault();

    const ME_real = parseFloat(document.getElementById('massaEspecifica').value);
    const t = parseFloat(document.getElementById('temperatura').value);

    const A = [913.76673, -221.75948, -59.61786, 146.82019, -566.51757, 621.18066, 3782.4439, -9745.3133, -9573.4653, 32677.808, 8763.7383, -39026.437];
    const B = [-0.7943755, -0.0012168407, 0.00000350178306, 0.000000177094407, -0.00000000341388209, -0.0000000000998802411];
    const C = [
        [-0.39158709, 1.1518337, -5.0416999, 13.381608, 4.589931, -118.21, 190.5402, 339.81954, -900.32344, -349.32012, 1285.9318],
        [-0.00012083196, -0.0057466248, 0.12030894, -0.23519694, -1.0362738, 2.1804505, 4.2763108, -6.8624848, -6.9384031, 7.4460428],
        [-0.000038683211, -0.00020911429, 0.0026713888, 0.0041042045, -0.049364385, -0.017952946, 0.29012506, 0.023001712, -0.54150139],
        [-0.00000056024906, -0.0000012649169, 0.000003486395, -0.0000015168726],
        [-0.000000014441741, 0.000000013470542]
    ];
    const m = [11, 10, 9, 4, 2];

    function calculate_ME(GM, t, A, B, C, m) {
        GM = GM / 100;
        let ME = A[0];

        for (let k = 2; k <= 12; k++) {
            ME += A[k - 1] * Math.pow(GM - 0.5, k - 1);
        }

        for (let k = 1; k <= 6; k++) {
            ME += B[k - 1] * Math.pow(t - 20, k);
        }

        for (let i = 1; i <= m.length; i++) {
            for (let k = 1; k <= m[i - 1]; k++) {
                if (i - 1 < C.length && k - 1 < C[i - 1].length) {
                    ME += C[i - 1][k - 1] * Math.pow(GM - 0.5, k) * Math.pow(t - 20, i);
                }
            }
        }

        return ME;
    }

    function find_GM(ME_real, t, A, B, C, m) {
        const epsilon = 1e-6;
        let GM_guess = 50;
        let ME_guess = calculate_ME(GM_guess, t, A, B, C, m);
        let iteration = 0;
        const maxIterations = 1000;

        while (Math.abs(ME_guess - ME_real) > epsilon && iteration < maxIterations) {
            const derivative = (calculate_ME(GM_guess + epsilon, t, A, B, C, m) - calculate_ME(GM_guess, t, A, B, C, m)) / epsilon;
            GM_guess -= (ME_guess - ME_real) / derivative;
            ME_guess = calculate_ME(GM_guess, t, A, B, C, m);
            iteration++;
        }

        return GM_guess;
    }

    const GM_estimated = find_GM(ME_real, t, A, B, C, m);
    const ME_20_C = calculate_ME(GM_estimated, 20, A, B, C, m);
    const GV = (GM_estimated) * ME_20_C / 789.23;
    const FCV = ME_real / ME_20_C;
    const currentDatetime = new Date().toLocaleString();

    document.getElementById('dataHora').textContent = `Data: ${currentDatetime}`;
    document.getElementById('massaEspecificaFornecida').textContent = `Massa Específica Lida: ${ME_real.toFixed(2)} kg/m³`;
    document.getElementById('temperaturaFornecida').textContent = `Temperatura: ${t.toFixed(2)} °C`;
    document.getElementById('teorAlcoolicoGM').textContent = `Teor Alcoólico GM: ${GM_estimated.toFixed(4)} % m/m`;
    document.getElementById('teorAlcoolicoGV').textContent = `Teor Alcoólico GV: ${GV.toFixed(4)} % v/v`;
    document.getElementById('massaEspecificaCorrigida').textContent = `Massa Específica Corrigida (20°C): ${ME_20_C.toFixed(4)} kg/m³`;
    document.getElementById('fatorCorrecaoVolume').textContent = `Fator de Correção de Volume (20°C): ${FCV.toFixed(4)}`;

    document.getElementById('resultados').style.display = 'block';
});
