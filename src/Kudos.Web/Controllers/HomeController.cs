using System.Web.Mvc;
using Kudos.Data;

namespace Kudos.Web.Controllers
{
	public class HomeController : Controller
	{
		private readonly KudosRepository repository = new KudosRepository();

		[HttpGet]
		public ActionResult Index()
		{
			return View();
		}

		[ActionName("Profile"), HttpGet]
		public ActionResult UserProfile()
		{
			// todo:
			// var name = User.Identity.Name;

			string name = "rjennings";
			var user = repository.GetUserByUserName(name);

			return View("Profile", user);
		}
	}
}
