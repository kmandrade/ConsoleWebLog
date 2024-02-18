$(document).ready(function () {
    let sistemas = JSON.parse(localStorage.getItem('sistemas') || '[]');
    let isUpdating = false;
    let updateInterval;
    const defaultUpdateInterval = 60000; // 60 segundos como padrão
    const fastUpdateInterval = 2000; // 2 segundo para atualização rápida

    atualizarListaSistemas();
    marcarSistemaComoAtivo();

    $('.systems-list').on('click', '.system', selecionarSistema);
    $('.systems-list').on('click', '.delete-system-button', deletarSistema);
    $('#saveButton').on('click', salvarSistema);
    $('#cancelButton').on('click', () => $('.lista-input').hide());
    $('#inputLog').change(() => $('.lista-input').toggle($('#inputLog').is(':checked')));


    
    $('#toggleLogsUpdate').click(function () {
        isUpdating = !isUpdating; // Inverte o estado de atualização
        if (isUpdating) {
            $(this).addClass('active').find('i').removeClass('fa-play').addClass('fa-pause');
            updateInterval = setInterval(atualizarLogs, fastUpdateInterval); // Atualiza a cada 1 segundo
        } else {
            $(this).removeClass('active').find('i').removeClass('fa-pause').addClass('fa-play');
            clearInterval(updateInterval);
            updateInterval = setInterval(atualizarLogs, defaultUpdateInterval); // Volta para o intervalo padrão
        }
    });

    updateInterval = setInterval(atualizarLogs, defaultUpdateInterval);
    atualizarLogs(); // Chamada inicial



    function marcarSistemaComoAtivo() {
        let selectedSystem = localStorage.getItem('selectedSystem');
        if (selectedSystem) {
            $('.system').each(function () {
                if ($(this).text().trim() === selectedSystem) {
                    $(this).addClass('active');
                }
            });
        }
    }

    function selecionarSistema() {
        let systemName = $(this).text().trim();
        $('.system').removeClass('active');
        $(this).addClass('active');
        localStorage.setItem('selectedSystem', systemName);
        atualizarLogs();
    }

    function salvarSistema() {
        let nomeSistema = $('#nomeSistema').val().trim();
        let caminhoArquivo = $('#caminhoArquivo').val().trim();

        if (!nomeSistema || !caminhoArquivo) {
            alert('Por favor, insira o nome do sistema e o caminho do arquivo.');
            return;
        }

        sistemas.push({ NomeSistema: nomeSistema, CaminhoLogSistema: caminhoArquivo });
        localStorage.setItem('sistemas', JSON.stringify(sistemas));

        $('#nomeSistema').val('');
        $('#caminhoArquivo').val('');
        $('.lista-input').hide();
        $('#inputLog').prop('checked', false);
        atualizarListaSistemas();
    }

    function deletarSistema() {
        let systemToDelete = $(this).data('system');
        sistemas = sistemas.filter(sistema => sistema.NomeSistema !== systemToDelete);
        localStorage.setItem('sistemas', JSON.stringify(sistemas));
        $(this).closest('li.system').remove();
        atualizarListaSistemas();
    }

    function atualizarLogs() {
        let selectedSystem = localStorage.getItem('selectedSystem');
        let sistemaSelecionado = sistemas.find(sistema => sistema.NomeSistema === selectedSystem);
        let data = sistemaSelecionado ? { name: sistemaSelecionado.NomeSistema, path: sistemaSelecionado.CaminhoLogSistema } : {};

        $.ajax({
            url: selecioneSistemaUrl,
            type: 'POST',
            data: data,
            success: (response) => $('.logs-container').html(response),
            error: (error) => console.error('Erro ao atualizar logs', error)
        });
    }
    

    function atualizarListaSistemas() {
        $('.systems-list').empty();
        sistemas.forEach(sistema => {
            $('.systems-list').append(`
                <li class="system">
                    ${sistema.NomeSistema}
                    <button type="button" class="delete-system-button" data-system="${sistema.NomeSistema}">
                        <i class="fas fa-trash"></i>
                    </button>
                </li>
            `);
        });
        marcarSistemaComoAtivo();
    }
    $(window).on('unload', function () {
        clearInterval(updateInterval);
    });
});
