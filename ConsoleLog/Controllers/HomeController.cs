﻿using ConsoleLog.Models;
using Microsoft.AspNetCore.Mvc;
using System.Diagnostics;
using ConsoleLog.Service;
using Newtonsoft.Json;
using AspNetCoreHero.ToastNotification.Abstractions;
using System.IO;

namespace ConsoleLogMVC.Controllers
{
    public class HomeController : Controller
    {
        private readonly ILogger<HomeController> _logger;
        private readonly INotyfService _notyfService;
        public HomeController(ILogger<HomeController> logger, INotyfService notyfService)
        {
            _logger = logger;
            _notyfService = notyfService;
        }
        public IActionResult Index()
        {
            var viewModel = new LogsViewModel();
            if (!string.IsNullOrEmpty(HttpContext.Session.GetString("SelectedSystemPath")))
            {
                viewModel = new LogsViewModel
                {
                    ListSistemas = new List<SistemasModel>(),
                    ListLogs = ObterLogsSistema(HttpContext.Session.GetString("SelectedSystemPath"))
                };
            }

            AdicionarNotificacao("warning", "Teste de aviso");
            return View(viewModel);
        }
        private void AdicionarNotificacao(string tipo, string mensagem)
        {
            var notificacoes = new List<object>();
            if (TempData.ContainsKey("Notificacoes"))
            {
                notificacoes = JsonConvert.DeserializeObject<List<object>>(TempData["Notificacoes"].ToString());
            }
            notificacoes.Add(new { Tipo = tipo, Mensagem = mensagem });
            TempData["Notificacoes"] = JsonConvert.SerializeObject(notificacoes);
        }
        public IActionResult SearchLog(string? path = null, string? filterType = null, string? filterValue = null)
        {
            string sistemasJson = HttpContext.Session.GetString("Sistemas");
            

            if (!string.IsNullOrEmpty(path) && string.IsNullOrEmpty(HttpContext.Session.GetString("SelectedSystemPath")))
            {

                HttpContext.Session.SetString("SelectedSystemPath", path);

            }
            var caminho = HttpContext.Session.GetString("SelectedSystemPath");

            var (model, valido) = ValidarFiltroLog(filterType, filterValue, caminho, sistemasJson);
            if (!valido)
            {
                AdicionarNotificacao("error", "Valor do filtro não corresponde.");
                return PartialView(model);
            }

            AdicionarNotificacao("success", "Operação realizada com sucesso!");
            return PartialView(model);
        }
        private static (LogsViewModel model, bool valido) ValidarFiltroLog(string filterType, string filterValue,
            string path, string sistemasJson)
        {
            List<SistemasModel> sistemas = new List<SistemasModel>();

            if (!string.IsNullOrEmpty(sistemasJson))
            {
                sistemas = JsonConvert.DeserializeObject<List<SistemasModel>>(sistemasJson);
            }
            var viewModel = new LogsViewModel
            {
                ListSistemas = sistemas
            };
            if (!string.IsNullOrWhiteSpace(filterType) && !string.IsNullOrWhiteSpace(filterValue)
                && filterType == "Status" && (filterValue != "200" && filterValue != "400"))
            {
                viewModel.ListLogs = ObterLogsSistema(path);
                return (viewModel, false);
            }
            viewModel.ListLogs = ObterLogsSistema(path, filterType, filterValue);
            return (viewModel, true);
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


        private static List<LogModel> ObterLogsSistema(string path, string? filterType = null, string? filterValue = null)
        {
            string logsString = ConsoleLogService.ObterInformacoesLog(path);
            List<LogModel> logs = ConsoleLogService.ParseLogsFromString(logsString);
            logs = (!logs.Any()) ? new List<LogModel>() : logs.OrderByDescending(l=>l.HorarioLog).ToList();
            if (!string.IsNullOrWhiteSpace(filterType) && !string.IsNullOrWhiteSpace(filterValue))
            {
                if (filterType == "Status")
                {
                    return logs
                    .FindAll(l => l.StatusCode == Convert.ToInt32(filterValue));
                }

            }
            return logs;
        }

    }
}