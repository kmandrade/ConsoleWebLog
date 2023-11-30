using Microsoft.AspNetCore.Mvc;

namespace ConsoleLogMVC.Controllers
{
    public class LogController : Controller
    {
        public IActionResult Index()
        {
            return View();
        }
    }
}
