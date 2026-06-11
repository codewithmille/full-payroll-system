import re
import os

files_to_update = [
    "app/(dashboard)/portal/payslips/[id]/page.tsx",
    "app/(dashboard)/portal/payslips/page.tsx",
    "app/(dashboard)/payroll/runs/[id]/page.tsx",
    "app/(dashboard)/payroll/runs/page.tsx",
    "app/(dashboard)/payroll/settings/page.tsx",
    "app/(dashboard)/hr/employees/[id]/page.tsx",
    "app/(dashboard)/hr/employees/new/page.tsx",
    "app/(dashboard)/hr/employees/page.tsx",
    "app/(dashboard)/portal/page.tsx",
]

base_dir = "c:/Users/sapin/Desktop/programming/Digital agency website/hr-system"

for relative_path in files_to_update:
    file_path = os.path.join(base_dir, relative_path)
    if not os.path.exists(file_path):
        print(f"File not found: {file_path}")
        continue
        
    print(f"Processing {relative_path}...")
    with open(file_path, "r", encoding="utf-8") as f:
        content = f.read()
        
    # 1. Replace template literal dollar currency references: `$${val}` -> `₱${val}`
    content = re.sub(r'\$\$\{', '₱${', content)
    content = re.sub(r'\+\$\$\{', '+₱${', content)
    content = re.sub(r'-\$\$\{', '-₱${', content)
    
    # 2. Replace static dollar values: `$200` -> `₱200`
    content = re.sub(r'\$(?=\d)', '₱', content)
    
    # 3. Replace JSX dollar currency references: `>${val}` -> `>₱{val}`
    content = re.sub(r'>\$\{', '>₱{', content)
    content = re.sub(r'\+\$\{', '+₱{', content)
    content = re.sub(r'-\$\{', '-₱{', content)
    content = re.sub(r'Base: \$\{', 'Base: ₱{', content)
    content = re.sub(r'Allowances: \$\{', 'Allowances: ₱{', content)
    content = re.sub(r'Rate: \$\{', 'Rate: ₱{', content)
    content = re.sub(r'capped at \$', 'capped at ₱', content)
    content = re.sub(r'Up to \$', 'Up to ₱', content)
    content = re.sub(r'Expenses: \$\{', 'Expenses: ₱{', content)
    content = re.sub(r'Take-Home: \$\{', 'Take-Home: ₱{', content)
    content = re.sub(r'Income: \$\{', 'Income: ₱{', content)
    content = re.sub(r'Deductions: \$\{', 'Deductions: ₱{', content)
    content = re.sub(r'Payout: \$\{', 'Payout: ₱{', content)
    
    with open(file_path, "w", encoding="utf-8") as f:
        f.write(content)
        
print("Currency replacement complete!")
