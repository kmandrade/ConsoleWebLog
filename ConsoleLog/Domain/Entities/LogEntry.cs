using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ConsoleLogMVC.Domain.Entities
{
    public class LogEntry
    {
        public DateTime Timestamp { get; set; }
        public List<string> Lines { get; set; } = new List<string>();
    }
}
