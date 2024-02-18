$(document).ready(function () {
    atualizarLogsAutomaticamente();

    function atualizarLogsAutomaticamente() {
        setInterval(atualizarLogs, 10000); // Atualiza a cada 10 segundos
    }

    function atualizarLogs() {
        let selectedSystem = localStorage.getItem('selectedSystem');
        let sistemas = JSON.parse(localStorage.getItem('sistemas') || '[]');
        let sistemaSelecionado = sistemas.find(s => s.NomeSistema === selectedSystem);
        let data = sistemaSelecionado ? { name: sistemaSelecionado.NomeSistema, path: sistemaSelecionado.CaminhoLogSistema } : {};

        $.ajax({
            url: selecioneSistemaUrl,
            type: 'POST',
            data: data,
            success: function (response) {
                $('.logs-container').html(response);
            },
            error: function (error) {
                console.error('Erro ao atualizar logs', error);
            }
        });
    }
});
