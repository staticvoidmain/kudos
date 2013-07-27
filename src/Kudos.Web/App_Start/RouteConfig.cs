using Microsoft.AspNet.SignalR;
using System.Web.Mvc;
using System.Web.Routing;

namespace Kudos.Web
{
	public class RouteConfig
	{
		public static void RegisterRoutes(RouteCollection routes)
		{
			// /signalr
			routes.MapHubs(new HubConfiguration() 
			{ 
				 EnableCrossDomain = false,
				 EnableDetailedErrors = true,
				 EnableJavaScriptProxies = true
			});

			routes.IgnoreRoute("{resource}.axd/{*pathInfo}");

			routes.MapRoute(
				name: "Default",
				url: "{controller}/{action}/{id}",
				defaults: new { controller = "Home", action = "Index", id = UrlParameter.Optional }
			);
		}
	}
}