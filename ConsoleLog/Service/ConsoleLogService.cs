using System.Text.RegularExpressions;
using System.Text;
using ConsoleLogMVC.Domain.Entities;
using System;
using ConsoleLog.Models;

namespace ConsoleLog.Service
{
    public static class ConsoleLogService
    {
        public static bool ObterArquivoLogMaisRecente(string systemName, string logFolderPath)
        {
            if (string.IsNullOrEmpty(logFolderPath))
                throw new ArgumentException("O caminho do diretório não pode ser nulo ou vazio.", nameof(logFolderPath));

            try
            {
                // Verifica se o diretório existe
                if (Directory.Exists(logFolderPath))
                {
                    // Obtém todos os arquivos no diretório
                    FileInfo[] files = new DirectoryInfo(logFolderPath).GetFiles();

                    // Obtém a data mais recente que é anterior à data atual
                    var mostRecentFile = files.Where(f => f.LastWriteTime.Date < DateTime.Today)
                                              .OrderByDescending(f => f.LastWriteTime)
                                              .FirstOrDefault();

                    // Verifica se encontrou algum arquivo que atende ao critério
                    return mostRecentFile != null;
                }
            }
            catch (Exception ex)
            {
                // Aqui você pode logar a exceção se necessário ou lidar com ela conforme a necessidade do seu aplicativo.
                Console.WriteLine("Ocorreu um erro ao verificar os arquivos do log: " + ex.Message);
            }

            // Se o diretório não existe ou uma exceção foi capturada, retorna false.
            return false;
        }
        #region ObterInformacoesLog
        public static string ObterInformacoesLog(string dsNomeLog, string path)
        {

            StringBuilder informacoesLog = new();
            var file = File.ReadLines(path);
            bool fileExists = File.Exists(path);
            try
            {
                var logEntries = fileExists ? GetDateAllFile(file) : throw new ArgumentNullException(dsNomeLog);

                // Buscar pela última ocorrência do termo no arquivo de logs
                foreach (var entry in logEntries)
                {
                    if (entry.Value.Lines.Exists(l => l.Contains(dsNomeLog.ToLower())))
                    {
                        foreach (var logLine in entry.Value.Lines)
                        {
                            informacoesLog.AppendLine(logLine);
                            // Se chegar a uma nova data, para de imprimir
                            if (Regex.IsMatch(logLine, @"^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}") && logLine != entry.Value.Lines[0])
                            {
                                break;
                            }
                        }
                        break; // Para após encontrar a primeira ocorrência
                    }
                }
                return informacoesLog.ToString();
            }
            catch (Exception)
            {
                throw new ArgumentNullException(dsNomeLog);
            }
        }
        public static string ObterInformacoesLog(string path)
        {

            StringBuilder informacoesLog = new StringBuilder();
           
            try
            {
                bool folderExists = Directory.Exists(path);
                if (!folderExists)
                {
                    throw new ArgumentNullException(nameof(path), "O caminho da pasta não existe.");
                }

                // Obtém todos os arquivos da pasta
                var files = Directory.GetFiles(path);

                // Ordena os arquivos por data de modificação, do mais recente para o mais antigo
                var mostRecentFile = files.OrderByDescending(f => new FileInfo(f).LastWriteTime).FirstOrDefault();

                if (string.IsNullOrEmpty(mostRecentFile))
                {
                    throw new FileNotFoundException("Nenhum arquivo encontrado na pasta.");
                }

                var fileLines = File.ReadLines(mostRecentFile);
                var logEntries = GetDateAllFile(fileLines);

                // Buscar pela última ocorrência do termo no arquivo de logs
                foreach (var entry in logEntries)
                {

                    foreach (var logLine in entry.Value.Lines)
                    {
                        informacoesLog.AppendLine(logLine);
                        // Se chegar a uma nova data, para de imprimir
                        if (Regex.IsMatch(logLine, @"^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}") && logLine != entry.Value.Lines[0])
                        {
                            break;
                        }
                    }

                }
                return informacoesLog.ToString();
            }
            catch (Exception)
            {
                throw new ArgumentNullException(path);
            }
        }
        private static SortedDictionary<DateTime, LogEntry> GetDateAllFile(IEnumerable<string> file)
        {
            var logEntries = new SortedDictionary<DateTime, LogEntry>(Comparer<DateTime>.Create((x, y) => y.CompareTo(x)));
            DateTime lastDate = DateTime.MinValue;

            // Ajuste na expressão regular para incluir a fração de segundo e o fuso horário
            var regexPattern = @"\[(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}\.\d{3} -\d{2}:\d{2})";

            foreach (var line in file)
            {
                // Regex para identificar a data e hora no início de cada linha de log
                var match = Regex.Match(line, regexPattern);
                if (match.Success)
                {
                    // Como o .NET padrão não lida diretamente com fuso horário na forma "-03:00" em DateTime.Parse,
                    // você pode remover a informação do fuso horário para o parsing, ou usar DateTimeOffset.Parse
                    // Exemplo removendo a informação do fuso horário para simplificar
                    var dateTimeStr = match.Groups[1].Value.Substring(0, match.Groups[1].Value.LastIndexOf(" "));
                    DateTime timestamp;
                    if (DateTime.TryParse(dateTimeStr, out timestamp))
                    {
                        lastDate = timestamp;

                        // Se ainda não tem uma entrada para essa data, cria uma nova
                        if (!logEntries.ContainsKey(timestamp))
                        {
                            logEntries[timestamp] = new LogEntry { Timestamp = timestamp, Lines = new List<string>() };
                        }
                    }
                }

                // Adiciona a linha ao log entry correspondente
                if (lastDate != DateTime.MinValue)
                {
                    logEntries[lastDate].Lines.Add(line);
                }
            }
            return logEntries;
        }
        #endregion


        public static List<LogModel> ParseLogsFromString(string logData)
        {
            List<LogModel> logs = new List<LogModel>();

            // Dividindo as entradas de log por linhas
            var lines = logData.Split(new[] { "\r\n", "\n" }, StringSplitOptions.RemoveEmptyEntries);

            foreach (var line in lines)
            {
                // Expressão regular para extrair as partes do log
                var logRegex = new Regex(@"\[(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}\.\d{3} -\d{2}:\d{2})\s+(\w{3})\]\s+(.*)");
                var match = logRegex.Match(line);

                if (match.Success)
                {
                    // Extrai as partes do log usando os grupos capturados pela expressão regular
                    var dateTimeStr = match.Groups[1].Value; 
                    var level = match.Groups[2].Value; // Nível do log (INF, ERR)
                    var message = match.Groups[3].Value; // Mensagem do log

                    // Tentativa de parse da data e hora do log
                    if (DateTime.TryParse(dateTimeStr, out DateTime horarioLog))
                    {
                        // Determina o status code baseado no nível do log
                        int statusCode = level == "ERR" ? 400 : 200;

                        var log = new LogModel
                        {
                            HorarioLog = horarioLog,
                            Client = "", // O exemplo de log não inclui informações do cliente
                            DescricaoLog = message,
                            StatusCode = statusCode
                        };

                        logs.Add(log);
                    }
                }
            }

            return logs;
        }


    }
}
