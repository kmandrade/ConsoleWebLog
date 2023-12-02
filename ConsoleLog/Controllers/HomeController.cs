using ConsoleLog.Models;
using Microsoft.AspNetCore.Mvc;
using System.Diagnostics;

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
            var systems = new List<SistemasModel>
            {
            // Adicione seus sistemas aqui
            new SistemasModel { NomeSistema = "All" },
            new SistemasModel { NomeSistema = "SSC" },
            new SistemasModel { NomeSistema = "ADC" },
            new SistemasModel { NomeSistema = "MOD" },
            new SistemasModel { NomeSistema = "ADC" }
            // outros sistemas...
            };

            var logs = new List<LogModel>
            {
            // Adicione seus logs aqui
            new LogModel { HorarioLog = DateTime.Now, Client = "adc-cliente", DescricaoLog = "Success", StatusCode = 200 },
            new LogModel { HorarioLog = DateTime.Now, Client = "adc-cliente", DescricaoLog = "Exception error msg", StatusCode = 500 },
            new LogModel { HorarioLog = DateTime.Now, Client = "adc-cliente", DescricaoLog = "Exception error msg", StatusCode = 500 },
            new LogModel { HorarioLog = DateTime.Now, Client = "adc-cliente", DescricaoLog = "Exception error msg", StatusCode = 500 },
            new LogModel { HorarioLog = DateTime.Now, Client = "adc-cliente", DescricaoLog = "Exception error msg", StatusCode = 500 }
            // outros logs...
            };

            var viewModel = new LogsViewModel
            {
                ListSistemas = systems,
                ListLogs = logs
            };

            return View(viewModel);
        }

        public IActionResult SelecionarSistema(string name)
        {
            return View();
        }
        public IActionResult ObterLog(string filterType, string filterValue)
        {
            return View();
        }

        [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
        public IActionResult Error()
        {
            return View(new ErrorViewModel { RequestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier });
        }
    }
}