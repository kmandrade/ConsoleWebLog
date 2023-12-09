using Microsoft.AspNetCore.Mvc;

namespace ConsoleLogMVC.Controllers
{
    public class SearchLogController : Controller
    {
        public IActionResult Index()
        {
            return View();
        }
    }
}
