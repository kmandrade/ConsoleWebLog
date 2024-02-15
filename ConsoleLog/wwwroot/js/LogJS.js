// LogsJS.js
$(document).ready(function () {

    
    // Verifica se algum sistema foi previamente selecionado e restaura esse estado
    let selectedSystem = localStorage.getItem('selectedSystem');
    if (selectedSystem) {
        $('.system').each(function () {
            if ($(this).text() === selectedSystem) {
                $(this).addClass('active');
            }
        });
    }
    // Delegação de evento para elementos '.system' dentro de '.systems-list'
    $('.systems-list').on('click', '.system', function () {
        // Remove a classe 'active' de todos os sistemas
        $('.system').removeClass('active');

        // Adiciona a classe 'active' ao sistema clicado e salva no localStorage
        $(this).addClass('active');
        let systemName = $(this).text().trim();
        localStorage.setItem('selectedSystem', systemName);

        
        // Recupera a lista atual de sistemas do localStorage
        let sistemas = JSON.parse(localStorage.getItem('sistemas') || '[]');

        // Encontra o caminho do arquivo para o sistema selecionado
        let sistemaSelecionado = sistemas.find(sistema => sistema.NomeSistema.trim() === systemName);
        let caminhoArquivo = sistemaSelecionado ? sistemaSelecionado.CaminhoLogSistema : null;


        //$('.logs-container').empty();

        // Faz uma chamada AJAX para atualizar a seleção no servidor
        $.ajax({
            url: selecioneSistemaUrl,
            type: 'POST',
            data: { name: systemName, path: caminhoArquivo },
            success: function (response) {
                // Atualiza o DOM com o conteúdo recebido
                $('.logs-container').html(response);
            },
            error: function (error) {
                console.error('Erro ao receber a lista de sistemas', error);
            }
        });
    });

    // Manipulador do evento de envio do formulário de filtro
    $('#filterForm').on('submit', function (event) {
        event.preventDefault();
        let filterType = $('#filterType').val();
        let filterValue = $('#filterValue').val();

        // Redireciona ou faz outra chamada AJAX conforme necessário
        window.location.href = obterLogUrl + '?filterType=' + encodeURIComponent(filterType) + '&filterValue=' + encodeURIComponent(filterValue);
    });

    // Enviar a lista de sistemas para o servidor
    let sistemas = JSON.parse(localStorage.getItem('sistemas') || '[]');
    if (sistemas.length > 0) {
        $.ajax({
            url: indexSistemas, // A URL da action no servidor que processa os sistemas
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(sistemas), // Certifique-se de que os dados estão corretamente formatados como JSON
            success: function (response) {
                
            },
            error: function (error) {
                console.error('Erro ao enviar a lista de sistemas', error);
            }
        });
    }

    // Adicionando evento de clique ao botão saveButton
    $('#saveButton').on('click', function () {
        let nomeSistema = $('#nomeSistema').val();
        let caminhoArquivo = $('#caminhoArquivo').val();

        // Verifique se o nome do sistema e o caminho do arquivo não estão vazios
        if (!nomeSistema || !caminhoArquivo) {
            alert('Por favor, insira o nome do sistema e o caminho do arquivo.');
            return;
        }

        // Recupera a lista atual de sistemas do localStorage
        let sistemas = JSON.parse(localStorage.getItem('sistemas') || '[]');

        // Adiciona o novo sistema à lista
        sistemas.push({ NomeSistema: nomeSistema, CaminhoLogSistema: caminhoArquivo });

        // Salva a lista atualizada no localStorage
        localStorage.setItem('sistemas', JSON.stringify(sistemas));

        // Adiciona o sistema à lista na página sem recarregar
        $('.systems-list').append(`
            <li class="system">
                ${nomeSistema}
                <button type="button" class="delete-system-button" data-system="${nomeSistema}">
                    <i class="fas fa-trash"></i>
                </button>
            </li>
        `);

        // Oculta a lista de inputs
        $('.lista-input').hide();

        // Limpa os campos de input
        $('#nomeSistema').val('');
        $('#caminhoArquivo').val('');

        console.log('Sistema salvo com sucesso.');
    });
    // Vincula o evento de clique para os botões de deletar sistema de forma dinâmica
    $('.systems-list').on('click', '.delete-system-button', function () {
        let systemToDelete = $(this).data('system');

        // Recupera a lista atual de sistemas do localStorage
        let sistemas = JSON.parse(localStorage.getItem('sistemas') || '[]');

        // Filtra a lista para remover o sistema especificado
        let filteredSistemas = sistemas.filter(sistema => sistema.NomeSistema !== systemToDelete);

        // Salva a lista atualizada no localStorage
        localStorage.setItem('sistemas', JSON.stringify(filteredSistemas));

        // Remove o sistema da lista no DOM
        $(this).closest('li.system').remove();

        // Previne ação padrão do botão (se for um <button> dentro de um <form>, por exemplo)
        return false;
    });

    // Renderiza a lista de sistemas ao carregar a página
    renderSystemsList();

    // Vincula o evento de clique para os botões de deletar sistema de forma dinâmica
    $('.systems-list').on('click', '.delete-system-button', function () {
        let systemToDelete = $(this).data('system');

        // Recupera a lista atual de sistemas do localStorage
        let sistemas = JSON.parse(localStorage.getItem('sistemas') || '[]');

        // Filtra a lista para remover o sistema especificado
        let filteredSistemas = sistemas.filter(function (sistema) {
            return sistema.NomeSistema !== systemToDelete;
        });

        // Salva a lista atualizada no localStorage
        localStorage.setItem('sistemas', JSON.stringify(filteredSistemas));

        // Remove o sistema da lista no DOM
        $(this).closest('li.system').remove();
    });


    // Adicionando evento de clique ao checkbox para controlar a exibição da div .lista-input
    $('#inputLog').change(function () {
        $('.lista-input').toggle(this.checked);
    });
    // Adicionando evento de clique ao botão cancelButton
    $('#cancelButton').on('click', function () {
        $('.lista-input').hide();
        $('#inputLog').prop('checked', false); // Resetar o estado do checkbox
    });
    
});

//Função para obter  alista de sistemas existentes e renderizar a classe de lixeira para cada item
function renderSystemsList() {
    let sistemas = JSON.parse(localStorage.getItem('sistemas') || '[]');
    let systemsList = $('.systems-list');
    systemsList.empty(); // Limpa a lista atual

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

// Funções auxiliares podem ser adicionadas fora do $(document).ready se não interagirem diretamente com o DOM
// Função para aplicar a máscara de data
function applyDateMask(value) {
    return value.replace(
        /^(\d{2})(\d{2})(\d{4}).*/,
        function (match, p1, p2, p3) {
            return `${p1}/${p2}/${p3}`;
        }
    );
}


// Evento de input para aplicar a máscara de data
$('#filterValue').on('input', function (e) {
    let input = $(this);
    let value = input.val();
    let filterType = $('#filterType').val();

    // Aplica a máscara se o tipo de filtro selecionado for 'Data'
    if (filterType === 'Date') {
        if (/^\d{2}$/.test(value) || /^\d{2}\/\d{2}$/.test(value)) {
            input.val(value + '/');
        } else if (value.length > 10) {
            input.val(applyDateMask(value)); // Limita a entrada para o formato de data
        }
    }
});


// Evento para permitir a exclusão com backspace
$('#filterValue').on('keydown', function (e) {
    let input = $(this);
    let value = input.val();
    let filterType = $('#filterType').val();

    // Verifica se é um evento de backspace e o tipo de filtro é 'Data'
    if (e.key === "Backspace") {
        // Permite o backspace se houver uma barra no final
        if (value[value.length - 1] === '/') {
            e.preventDefault();
            input.val(value.slice(0, -1));
        }
    }
});