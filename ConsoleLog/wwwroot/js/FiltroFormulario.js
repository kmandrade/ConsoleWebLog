$(document).ready(function () {
    $('#filterForm').on('submit', filtrarLogs);
    $('#filterValue').on('input', aplicarMascaraData);
    $('#filterValue').on('keydown', permitirExclusaoComBackspace);

    function filtrarLogs(event) {
        event.preventDefault();
        let filterType = $('#filterType').val();
        let filterValue = $('#filterValue').val();

        // Aqui você pode definir a lógica para filtrar os logs com base nos valores obtidos
        // Por exemplo, fazendo uma chamada AJAX ao servidor para buscar os logs filtrados
        $.ajax({
            url: obterLogUrl, // Certifique-se de que esta URL aponta para a ação correta no servidor
            type: 'GET', // Método HTTP adequado para buscar dados
            data: {
                filterType: filterType,
                filterValue: filterValue
            },
            success: function (response) {
                // Atualiza o conteúdo da div '.logs-container' com os logs filtrados
                $('.logs-container').html(response);
            },
            error: function (xhr, status, error) {
                console.error('Erro ao filtrar logs', error);
            }
        });
    }

    function aplicarMascaraData() {
        let input = $(this);
        let value = input.val();
        let filterType = $('#filterType').val();

        // Verifica se o tipo de filtro selecionado é 'Data' e aplica a máscara
        if (filterType === 'Date') {
            let dataFormatada = value.replace(/[^0-9]/g, '').replace(/(\d{2})(\d{2})(\d{4})/, '$1/$2/$3');
            input.val(dataFormatada);
        }
    }

    function permitirExclusaoComBackspace(e) {
        if (e.key === "Backspace") {
            let input = $(this);
            let value = input.val();
            let filterType = $('#filterType').val();

            if (filterType === 'Date' && value[value.length - 1] === '/') {
                // Impede a exclusão do caractere '/' ao pressionar backspace
                e.preventDefault();
                input.val(value.slice(0, -1));
            }
        }
    }
});
