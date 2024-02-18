$(document).ready(function () {
    inicializarSelecaoSistema();
    $('#saveButton').on('click', salvarSistema);
    $('#cancelButton').on('click', cancelarAdicaoSistema);
    $('#inputLog').change(toggleAdicaoSistema);

    function inicializarSelecaoSistema() {
        let selectedSystem = localStorage.getItem('selectedSystem');
        if (selectedSystem) {
            marcarSistemaComoAtivo(selectedSystem);
        }

        $('.systems-list').on('click', '.system', selecionarSistema);
        $('.systems-list').on('click', '.delete-system-button', deletarSistema);
        renderSystemsList();
    }

    function marcarSistemaComoAtivo(selectedSystem) {
        $('.system').each(function () {
            if ($(this).text().trim() === selectedSystem) {
                $(this).addClass('active');
            }
        });
    }

    function selecionarSistema() {
        $('.system').removeClass('active');
        $(this).addClass('active');
        let systemName = $(this).text().trim();
        localStorage.setItem('selectedSystem', systemName);
        atualizarLogs(); // Chama a função para atualizar os logs com base no sistema selecionado
    }

    function salvarSistema() {
        let nomeSistema = $('#nomeSistema').val().trim();
        let caminhoArquivo = $('#caminhoArquivo').val().trim();

        if (!nomeSistema || !caminhoArquivo) {
            alert('Por favor, insira o nome do sistema e o caminho do arquivo.');
            return;
        }

        let sistemas = JSON.parse(localStorage.getItem('sistemas') || '[]');
        sistemas.push({ NomeSistema: nomeSistema, CaminhoLogSistema: caminhoArquivo });
        localStorage.setItem('sistemas', JSON.stringify(sistemas));

        $('.systems-list').append(`
            <li class="system">
                ${nomeSistema}
                <button type="button" class="delete-system-button" data-system="${nomeSistema}">
                    <i class="fas fa-trash"></i>
                </button>
            </li>
        `);

        $('#nomeSistema').val('');
        $('#caminhoArquivo').val('');
        $('.lista-input').hide();
        $('#inputLog').prop('checked', false);
    }

    function deletarSistema() {
        let systemToDelete = $(this).data('system');
        let sistemas = JSON.parse(localStorage.getItem('sistemas') || '[]');
        let filteredSistemas = sistemas.filter(sistema => sistema.NomeSistema !== systemToDelete);
        localStorage.setItem('sistemas', JSON.stringify(filteredSistemas));
        $(this).closest('li.system').remove();
    }

    function renderSystemsList() {
        let sistemas = JSON.parse(localStorage.getItem('sistemas') || '[]');
        let systemsList = $('.systems-list');
        systemsList.empty();
        sistemas.forEach(function (sistema) {
            systemsList.append(`
                <li class="system">
                    ${sistema.NomeSistema}
                    <button type="button" class="delete-system-button" data-system="${sistema.NomeSistema}">
                        <i class="fas fa-trash"></i>
                    </button>
                </li>
            `);
        });
    }

    function toggleAdicaoSistema() {
        $('.lista-input').toggle(this.checked);
    }

    function cancelarAdicaoSistema() {
        $('.lista-input').hide();
        $('#inputLog').prop('checked', false);
        $('#nomeSistema').val('');
        $('#caminhoArquivo').val('');
    }
});
