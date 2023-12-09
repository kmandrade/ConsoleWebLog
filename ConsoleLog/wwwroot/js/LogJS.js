// LogsJS.js
$(document).ready(function () {
    // Verifica se algum sistema foi previamente selecionado e restaura esse estado
    var selectedSystem = localStorage.getItem('selectedSystem');
    if (selectedSystem) {
        $('.system').each(function () {
            if ($(this).text() === selectedSystem) {
                $(this).addClass('active');
            }
        });
    }
    // Evento de clique para os elementos do sistema
    $('.system').on('click', function () {
        // Remove a classe 'active' de todos os sistemas
        $('.system').removeClass('active');

        // Adiciona a classe 'active' ao sistema clicado e salva no localStorage
        $(this).addClass('active');
        var systemName = $(this).text();
        localStorage.setItem('selectedSystem', systemName);

        // Define o estado de seleção
        var isSelected = $(this).hasClass('active');

        // Faz uma chamada AJAX para atualizar a seleção no servidor
        $.ajax({
            url: selecioneSistemaUrl,
            type: 'POST',
            data: { name: systemName, selected: isSelected },
            
        });
    });

    // Manipulador do evento de envio do formulário de filtro
    $('#filterForm').on('submit', function (event) {
        event.preventDefault();
        var filterType = $('#filterType').val();
        var filterValue = $('#filterValue').val();

        // Redireciona ou faz outra chamada AJAX conforme necessário
        window.location.href = obterLogUrl + '?filterType=' + encodeURIComponent(filterType) + '&filterValue=' + encodeURIComponent(filterValue);
    });

});

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
    var input = $(this);
    var value = input.val();
    var filterType = $('#filterType').val();

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
    var input = $(this);
    var value = input.val();
    var filterType = $('#filterType').val();

    // Verifica se é um evento de backspace e o tipo de filtro é 'Data'
    if (e.key === "Backspace") {
        // Permite o backspace se houver uma barra no final
        if (value[value.length - 1] === '/') {
            e.preventDefault();
            input.val(value.slice(0, -1));
        }
    }
});