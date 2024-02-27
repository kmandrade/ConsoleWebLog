$(document).ready(function () {
    const defaultUpdateInterval = 60000; // 60 segundos como padrão
    const fastUpdateInterval = 2000; // 2 segundos para atualização rápida
    let sistemas = JSON.parse(localStorage.getItem('sistemas') || '[]');
    let isUpdating = false;
    let updateInterval = setInterval(atualizarLogs, defaultUpdateInterval);
    let pathAtualSistema = ""; // Variável global para armazenar o path do sistema selecionado

    inicializar();

    function inicializar() {
        limparFiltros(); 
        atualizarListaSistemas();
        configurarEventos();
       
    }
    function limparFiltros() {
        $('#filterType').val('Status'); 
        $('#filterValue').val(''); 
    }
    function configurarEventos() {
        $('.systems-list').on('click', '.system', selecionarSistema);
        $('.systems-list').on('click', '.delete-system-button', deletarSistema);
        $('#saveButton').on('click', salvarSistema);
        $('#cancelButton').on('click', () => $('.lista-input').hide());
        $('#inputLog').change(() => $('.lista-input').toggle($('#inputLog').is(':checked')));
        $('#toggleLogsUpdate').click(toggleAtualizacaoLogs);

        // Modificando a forma como o event handler de submissão do formulário é aplicado
        $(document).on('submit', '#filterForm', function (e) {
            e.preventDefault(); // Previne a submissão tradicional do formulário
            let path = sistemas.find(s => s.NomeSistema === localStorage.getItem('selectedSystem'))?.CaminhoLogSistema;
            if (!path) {
                alert("Por favor, selecione um sistema antes de usar o filtro.");
                return;
            }
            atualizarLogs(path);
        });
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

    function selecionarSistema(event) {
        $('.system').removeClass('active');
        let selectedElement = $(event.currentTarget);
        selectedElement.addClass('active');
        let selectedSystemName = selectedElement.text().trim();
        localStorage.setItem('selectedSystem', selectedSystemName);

        let sistemaSelecionado = sistemas.find(s => s.NomeSistema === selectedSystemName);
        if (sistemaSelecionado) {
            pathAtualSistema = sistemaSelecionado.CaminhoLogSistema; // Atualiza a variável global com o path do sistema selecionado
            atualizarLogs(pathAtualSistema);
        }
    }

    function atualizarLogs(path) {
        // Se nenhum path for fornecido, usa o path da variável global
        path = path || pathAtualSistema;

        if (!path) {
            console.error("Nenhum sistema selecionado para atualizar logs.");
            return; // Sai da função se nenhum sistema estiver selecionado
        }

        $.ajax({
            url: '/Home/SearchLog',
            type: 'POST',
            data: {
                filterType: $('#filterType').val(),
                filterValue: $('#filterValue').val(),
                path: path
            },
            success: function (data) {
                $('.logs-container').html(data);
            },
            error: function (xhr, status, error) {
                console.error("Erro ao atualizar logs: ", error);
            }
        });
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

    


    function toggleAtualizacaoLogs() {
        isUpdating = !isUpdating;
        $(this).toggleClass('active');
        $(this).find('i').toggleClass('fa-play fa-pause');
        clearInterval(updateInterval);

        if (isUpdating) {
            // Reinicia o temporizador sem passar um path específico, já que atualizarLogs vai buscar o path da variável global
            updateInterval = setInterval(atualizarLogs, fastUpdateInterval);
        }
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
