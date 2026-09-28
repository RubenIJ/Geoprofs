using System;
using System.Collections.Generic;
using System.Text;

namespace Geoprofs.Code
{
    internal class VerlofAanvraag
    {
        public int id { get; set; }
        public int user_id { get; set; }
        public string reason { get; set; }
        public string start_date { get; set; }
        public string end_date { get; set; }
        public string status { get; set; }
    }
}
