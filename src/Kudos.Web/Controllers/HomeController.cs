using System.Web.Mvc;

namespace Kudos.Web.Controllers
{
	public class HomeController : Controller
	{
		public ActionResult Index()
		{
			return View();
		}

		public ActionResult UserProfile()
		{
			return View();
		}
	}
}
