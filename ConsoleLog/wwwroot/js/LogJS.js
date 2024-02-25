$(document).ready(function () {
    const defaultUpdateInterval = 60000; // 60 segundos como padrão
    const fastUpdateInterval = 2000; // 2 segundos para atualização rápida
    let sistemas = JSON.parse(localStorage.getItem('sistemas') || '[]');
    let isUpdating = false;
    let updateInterval = setInterval(atualizarLogs, defaultUpdateInterval);

    inicializar();

    function inicializar() {
        atualizarListaSistemas();
        marcarSistemaComoAtivo();
        configurarEventos();
        selecionarSistema();
    }

    function configurarEventos() {
        $('.systems-list').on('click', '.system', selecionarSistema);
        $('.systems-list').on('click', '.delete-system-button', deletarSistema);
        $('#saveButton').on('click', salvarSistema);
        $('#cancelButton').on('click', () => $('.lista-input').hide());
        $('#inputLog').change(() => $('.lista-input').toggle($('#inputLog').is(':checked')));
        $('#toggleLogsUpdate').click(toggleAtualizacaoLogs);
        
    }

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
        $('.system').removeClass('active');
        $(this).addClass('active');
        let selectedSystemName = $(this).text().trim();
        localStorage.setItem('selectedSystem', selectedSystemName);

        let sistemaSelecionado = sistemas.find(s => s.NomeSistema === selectedSystemName);
        if (sistemaSelecionado) {
            // Chamada AJAX para salvar o path do sistema selecionado na sessão do lado do servidor
            $.ajax({
                url: '/Home/SearchLog',
                method: 'POST',
                data: { path: sistemaSelecionado.CaminhoLogSistema },
                success: function (response) {
                    // Após salvar com sucesso, atualiza os logs
                    atualizarLogs();
                },
                error: function (xhr, status, error) {
                    console.error("Erro ao salvar o path do sistema selecionado na sessão.", error);
                }
            });
        }
        
    }


    function salvarSistema() {
        let nomeSistema = $('#nomeSistema').val().trim();
        let caminhoArquivo = $('#caminhoArquivo').val().trim();
        if (nomeSistema && caminhoArquivo) {
            sistemas.push({ NomeSistema: nomeSistema, CaminhoLogSistema: caminhoArquivo });
            localStorage.setItem('sistemas', JSON.stringify(sistemas));
            resetarCamposFormulario();
            atualizarListaSistemas();
        } else {
            alert('Por favor, insira o nome do sistema e o caminho do arquivo.');
        }
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
        let sistemaSelecionado = sistemas.find(s => s.NomeSistema === selectedSystem);

        if (sistemaSelecionado) {
            $.ajax({
                url: '/Home/SearchLog',
                type: 'POST',
                data: {
                    filterType: $('#filterType').val(),
                    filterValue: $('#filterValue').val(),
                    path: sistemaSelecionado.CaminhoLogSistema
                },
                success: function (data) {
                    $('.logs-container').html(data); // Garanta que '.logs-container' está correto
                },
                error: function (xhr, status, error) {
                    console.error("Erro ao atualizar logs: ", error);
                }
            });
        }
        
    }




    function toggleAtualizacaoLogs() {
        isUpdating = !isUpdating;
        $(this).toggleClass('active');
        $(this).find('i').toggleClass('fa-play fa-pause');
        clearInterval(updateInterval);
        updateInterval = setInterval(atualizarLogs, isUpdating ? fastUpdateInterval : defaultUpdateInterval);
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

    function resetarCamposFormulario() {
        $('#nomeSistema').val('');
        $('#caminhoArquivo').val('');
        $('.lista-input').hide();
        $('#inputLog').prop('checked', false);
    }
});
