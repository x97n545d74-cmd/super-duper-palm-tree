"""Checks the positioning and flows reader against rows taken from the real files. No network."""
import json
import pathlib
import sys
import tempfile
import unittest

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))
import flows  # noqa: E402

OI = '''""Participant wise Open Interest (no. of contracts) in Equity Derivatives as on Nov 17, 2026"",,,,,,,,,,,,,,
Client Type,Future Index Long,Future Index Short,Future Stock Long,Future Stock Short       ,Option Index Call Long,Option Index Put Long,Option Index Call Short,Option Index Put Short,Option Stock Call Long,Option Stock Put Long,Option Stock Call Short,Option Stock Put Short,Total Long Contracts      ,Total Short Contracts
Client,170907,115613,3180794,391846,2383850,2546860,2360166,2891975,2253990,1212779,1277236,1226403,11749181,8263239
DII,53126,30387,373203,4296063,5214,114354,350,1200,17855,42968,477319,35480,606720,4840799
FII,65568,130691,3629602,2645357,657681,1019332,774511,649719,347966,437009,468149,356677,6157158,5025104
Pro,28628,41538,807203,657536,829209,780407,740927,918059,1431984,1189236,1829091,1263432,5066667,5450583
TOTAL,318229,318229,7990802,7990802,3875954,4460953,3875954,4460953,4051795,2881992,4051795,2881992,23579725,23579725
'''
row = lambda *cells: "<tr>" + "".join("<td>%s</td>" % c for c in cells) + "</tr>"
NSDL = "<table>" + row("Reporting Date", "Debt/Debt-VRR/Equity/Hybrid", "Investment Route", "Gross Purchases(Rs. Crore)", "Gross Sales (Rs. Crore)", "Net Investment (Rs. Crore)", "Net Investment US($) million", "Conversion") \
    + row("17-Nov-2026", "Equity", "Stock Exchange", "16657.30", "11549.69", "5107.61", "542.69", "Rs.94.1159") \
    + row("Primary market &amp; others", "0.00", "0.00", "0.00", "0.00") + row("Sub-total", "16657.30", "11549.69", "5107.61", "542.69") \
    + row("Debt-General Limit", "Stock Exchange", "341.86", "169.47", "172.39", "18.32") + row("Sub-total", "341.86", "204.63", "137.23", "14.58") \
    + row("Debt-VRR", "Stock Exchange", "3.97", "529.49", "(525.52)", "(55.84)") + row("Sub-total", "3.97", "2383.64", "(2379.67)", "(252.85)") \
    + row("Hybrid", "Stock Exchange", "18.66", "23.40", "(4.74)", "(0.50)") + row("Sub-total", "18.66", "23.40", "(4.74)", "(0.50)") \
    + row("Total", "18231.86", "15758.04", "2473.82", "262.84") + "</table>"


class Flows(unittest.TestCase):
    def test_participants(self):
        p = flows.parse_participants(OI)
        self.assertEqual((p["FII"]["index_futures_net"], p["FII"]["index_futures_long_pct"]), (-65123.0, 33.4))
        self.assertEqual(p["Client"]["index_futures_long_pct"], 59.6)
        self.assertEqual(p["DII"]["stock_futures_net"], 373203 - 4296063)
        self.assertEqual(p["index_put_call_ratio"], 1.15)
        self.assertIsNone(flows.parse_participants("nothing here"))

    def test_fpi_page_with_bracketed_negatives(self):
        f = flows.parse_fpi(NSDL)
        self.assertEqual(f, {"equity_net_cr": 5107.61, "total_net_cr": 2473.82, "date": "2026-11-17", "debt_net_cr": round(137.23 - 2379.67, 2)})
        self.assertIsNone(flows.parse_fpi("<html>Request Rejected</html>"))

    def test_ban_list(self):
        self.assertEqual(flows.parse_ban("Securities in Ban For Trade Date 18-NOV-2026:\n1,KAYNES\n2,RBLBANK\n"), ["KAYNES", "RBLBANK"])
        self.assertEqual(flows.parse_ban("Securities in Ban For Trade Date 18-NOV-2026:\n"), [])

    def test_update_saves_once_a_day_and_survives_a_dead_source(self):
        with tempfile.TemporaryDirectory() as tmp:
            tmp = pathlib.Path(tmp)
            def get(url):
                if "participant" in url: return OI
                if "secban" in url: return "1,KAYNES\n"
                if "nsdl" in url: raise OSError("rejected")
                return json.dumps({"rates": {"INR": 93.93}})
            self.assertTrue(flows.update(tmp, get, "2026-11-17", log=lambda *_: None))
            self.assertFalse(flows.update(tmp, get, "2026-11-17", log=lambda *_: None))            # already on file
            self.assertFalse(flows.update(tmp, lambda u: (_ for _ in ()).throw(OSError("down")), "2026-11-18", log=lambda *_: None))
            s = flows.summary(flows.load_history(tmp))
            self.assertEqual((s["ban_list"], s["usd_inr"], s["fii_index_futures_long_pct"], s["days_on_file"]), (["KAYNES"], 93.93, 33.4, 1))
            self.assertIn("33.4% of their index futures long (net short)", s["in_words"])
            self.assertNotIn("fpi_equity_net_cr", s)

    def test_summary_changes_and_five_day_flow(self):
        day = lambda d, net, eq: {"date": d, "participants": {"FII": {"index_futures_net": net, "index_futures_long_pct": 40.0}},
                                  "fpi": {"date": d, "equity_net_cr": eq}}
        s = flows.summary([day("2026-11-16", -70000, -1200.0), day("2026-11-17", -65123, 5107.61)])
        self.assertEqual((s["fii_index_futures_net_change"], s["fpi_equity_net_5d_cr"]), (4877, 3907.61))
        self.assertIn("bought a net Rs 5,108 crore", s["in_words"])
        self.assertIsNone(flows.summary([]))


if __name__ == "__main__":
    unittest.main()
