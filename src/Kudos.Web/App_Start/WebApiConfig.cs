using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Web.Http;

namespace Kudos.Web
{
	public static class WebApiConfig
	{
		public static void Register(HttpConfiguration config)
		{
			config.Routes.MapHttpRoute(
				name: "DefaultApi",
				routeTemplate: "api/{controller}/{action}/{id}",
				defaults: new { id = RouteParameter.Optional }
			);

			ConfigureDebugFormatters();
		}

		[Conditional("DEBUG")]
		private static void ConfigureDebugFormatters()
		{
			var formatters = GlobalConfiguration.Configuration.Formatters;

			formatters.Remove(formatters.XmlFormatter);

			formatters.JsonFormatter.Indent = true;
		}
	}
}