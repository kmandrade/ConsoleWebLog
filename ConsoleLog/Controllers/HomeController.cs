using ConsoleLog.Models;
using Microsoft.AspNetCore.Mvc;
using System.Diagnostics;
using ConsoleLog.Service;
using Newtonsoft.Json;

namespace ConsoleLogMVC.Controllers
{
    public class HomeController : Controller
    {
        private readonly ILogger<HomeController> _logger;

        public HomeController(ILogger<HomeController> logger)
        {
            _logger = logger;
        }
        public IActionResult Index()
        {
            // Recuperar os dados da sessão ou outra forma de armazenamento persistente
            List<SistemasModel> sistemas = new List<SistemasModel>();

            // Tentar recuperar a lista de sistemas da sessão
            string sistemasJson = HttpContext.Session.GetString("Sistemas");
            if (!string.IsNullOrEmpty(sistemasJson))
            {
                sistemas = JsonConvert.DeserializeObject<List<SistemasModel>>(sistemasJson);
            }
            if (sistemas == null)
            {
                sistemas = new List<SistemasModel>()
                {
                    new SistemasModel()
                    {
                        NomeSistema = "All", CaminhoLogSistema = "caminho"
                    }
                };
            }

            var viewModel = new LogsViewModel
            {
                ListSistemas = sistemas,
                ListLogs = null
            };

            return View(viewModel);
        }

        public IActionResult SearchLog(string? name, string? path, string? filterType = null, string? filterValue = null)
        {

            List<SistemasModel> sistemas = new List<SistemasModel>();

            string sistemasJson = HttpContext.Session.GetString("Sistemas");
            if (!string.IsNullOrEmpty(sistemasJson))
            {
                sistemas = JsonConvert.DeserializeObject<List<SistemasModel>>(sistemasJson);
            }
            var viewModel = new LogsViewModel
            {
                ListSistemas = sistemas,
                ListLogs = ObterLogsSistema(path)
            };

            return PartialView(viewModel);
        }



        /// <summary>
        /// Salva o caminho da pasta onde existe o log do sistema.
        /// </summary>
        /// <param name="nomeSistema"></param>
        /// <param name="caminhoArquivo"></param>
        /// <returns></returns>
        public IActionResult SalvarSistemaLog(string nomeSistema, string caminhoArquivo)
        {
            if (ConsoleLogService.ObterArquivoLogMaisRecente(nomeSistema, caminhoArquivo))
            {
                var sistema = new SistemasModel()
                {
                    NomeSistema = nomeSistema,
                    CaminhoLogSistema = caminhoArquivo
                };

                ViewBag.ObjectToStore = JsonConvert.SerializeObject(sistema);
            }
            return RedirectToAction("Index");
        }


        private static List<LogModel> ObterLogsSistema(string path)
        {
            string logsString = ConsoleLogService.ObterInformacoesLog(path);
            List<LogModel> logs = ConsoleLogService.ParseLogsFromString(logsString);
            return logs;
        }

    }
}