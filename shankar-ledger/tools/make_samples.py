"""Makes two made-up sample papers for trying the checker: a Tally-style ledger
and a supplier statement. The party is fictional. Run: python3 tools/make_samples.py"""
import os
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet

OUT = os.path.join(os.path.dirname(__file__), '..', 'samples')
S = getSampleStyleSheet()

def inr(n):
    if not n: return ''
    s = f'{n:.2f}'; whole, dec = s.split('.')
    if len(whole) > 3:
        head, tail = whole[:-3], whole[-3:]
        parts = []
        while len(head) > 2: parts.insert(0, head[-2:]); head = head[:-2]
        if head: parts.insert(0, head)
        whole = ','.join(parts + [tail])
    return f'{whole}.{dec}'

def build(name, heading, lines, rows, open_row, close_row, totals):
    doc = SimpleDocTemplate(os.path.join(OUT, name), pagesize=A4, leftMargin=36, rightMargin=36, topMargin=36, bottomMargin=36)
    data = [['Date', 'Particulars', 'Vch Type', 'Vch No.', 'Debit', 'Credit'], open_row]
    data += [[d, p, t, r, inr(dr), inr(cr)] for d, p, t, r, dr, cr in rows]
    data += [['', '', '', '', inr(totals[0]), inr(totals[1])], close_row, ['', '', '', '', inr(totals[2]), inr(totals[2])]]
    tbl = Table(data, colWidths=[62, 170, 70, 95, 62, 62], repeatRows=1)
    tbl.setStyle(TableStyle([
        ('FONT', (0, 0), (-1, 0), 'Helvetica-Bold', 9), ('FONT', (0, 1), (-1, -1), 'Helvetica', 9),
        ('ALIGN', (4, 0), (5, -1), 'RIGHT'), ('LINEBELOW', (0, 0), (-1, 0), 0.8, colors.black),
        ('LINEABOVE', (4, -3), (5, -3), 0.5, colors.black), ('LINEABOVE', (4, -1), (5, -1), 0.5, colors.black),
        ('LINEBELOW', (4, -1), (5, -1), 0.8, colors.black), ('FONT', (0, -1), (-1, -1), 'Helvetica-Bold', 9),
    ]))
    doc.build([Paragraph(heading, S['Title'])] + [Paragraph(l, S['Normal']) for l in lines] + [Spacer(1, 12), tbl])

os.makedirs(OUT, exist_ok=True)

ours = [
    ('04-04-2026', 'By Purchase', 'Purchase', 'DPD/26-27/0112', 0, 24680),
    ('10-04-2026', 'To HDFC Bank', 'Payment', 'CHQ 004512', 18450, 0),
    ('18-04-2026', 'By Purchase', 'Purchase', 'DPD/26-27/0187', 0, 31250),
    ('25-04-2026', 'To Purchase Return (expiry)', 'Debit Note', 'DN-07', 4260, 0),
    ('02-05-2026', 'To HDFC Bank', 'Payment', 'NEFT', 24680, 0),
    ('09-05-2026', 'By Purchase', 'Purchase', 'DPD/26-27/0301', 0, 15840),
    ('21-05-2026', 'By Purchase', 'Purchase', 'DPD/26-27/0366', 0, 42118),
    ('03-06-2026', 'To HDFC Bank', 'Payment', 'UPI', 30000, 0),
    ('14-06-2026', 'By Purchase', 'Purchase', 'DPD/26-27/0455', 0, 9984),
    ('27-06-2026', 'To HDFC Bank', 'Payment', 'CHQ 004561', 25000, 0),
]
dr = sum(r[4] for r in ours); cr = sum(r[5] for r in ours) + 18450
build('sample-our-ledger-tally.pdf', 'Shankar Medicos',
      ['<b>Demo Pharma Distributors</b> (sample, not a real party)', 'Ledger Account', '1-Apr-2026 to 30-Jun-2026'],
      ours, ['01-04-2026', 'By Opening Balance', '', '', '', inr(18450)],
      ['', 'To Closing Balance', '', '', inr(cr - dr), ''], (dr, cr, cr))

theirs = [
    ('04/04/2026', 'Sales', 'Sales', '112', 24680, 0),
    ('12/04/2026', 'Cheque received 004512', 'Receipt', '004512', 0, 18450),
    ('18/04/2026', 'Sales', 'Sales', '187', 31250, 0),
    ('03/05/2026', 'Bank receipt NEFT', 'Receipt', 'NEFT', 0, 24680),
    ('09/05/2026', 'Sales', 'Sales', '301', 16420, 0),
    ('21/05/2026', 'Sales', 'Sales', '366', 42118, 0),
    ('03/06/2026', 'Bank receipt UPI', 'Receipt', 'UPI', 0, 30000),
    ('08/06/2026', 'Sales', 'Sales', '431', 7000, 0),
    ('14/06/2026', 'Sales', 'Sales', '455', 9984, 0),
    ('20/06/2026', 'Interest on late payment', 'Journal', 'INT', 500, 0),
]
dr = sum(r[4] for r in theirs) + 18450; cr = sum(r[5] for r in theirs)
build('sample-party-statement.pdf', 'Demo Pharma Distributors',
      ['(sample, not a real party)', 'Statement of Account: <b>Shankar Medicos</b>', 'Period: 01/04/2026 to 30/06/2026'],
      theirs, ['01/04/2026', 'Opening Balance', '', '', inr(18450), ''],
      ['', 'Closing Balance', '', '', '', inr(dr - cr)], (dr, cr, dr))
print('wrote samples to', os.path.abspath(OUT))
