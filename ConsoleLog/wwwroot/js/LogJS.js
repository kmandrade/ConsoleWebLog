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