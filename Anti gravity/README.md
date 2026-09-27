# Scientific Calculator Project (C math.h & Web Application)

## 📌 Project Overview
This project contains two implementations of a high-precision **Scientific Calculator**:
1. **Console Application in C (`scientific_calculator.c`)**: Built using ANSI C / C99 standard library `<math.h>`, fully compiled with GCC (`scientific_calculator.exe`).
2. **Web Application (`index.html`, `style.css`, `app.js`)**: An ultra-modern, glassmorphic dark-mode web calculator mirroring all the mathematical functions from `<math.h>`.

---

## 🧮 What can we do using C `<math.h>` for a Scientific Calculator?

The C standard `<math.h>` header provides a comprehensive collection of mathematical functions:

| Category | C Functions | Mathematical Operation | Domain / Constraints |
| :--- | :--- | :--- | :--- |
| **Trigonometric** | `sin(x)`, `cos(x)`, `tan(x)` | $\sin(x)$, $\cos(x)$, $\tan(x)$ | $x$ must be in **radians**. Degree formula: $rad = deg \times \frac{\pi}{180}$ |
| **Inverse Trigonometric** | `asin(x)`, `acos(x)`, `atan(x)`, `atan2(y, x)` | $\arcsin(x)$, $\arccos(x)$, $\arctan(x)$ | `asin` & `acos` domain: $[-1.0, 1.0]$. Returns radians. |
| **Hyperbolic** | `sinh(x)`, `cosh(x)`, `tanh(x)` | $\sinh(x)$, $\cosh(x)$, $\tanh(x)$ | $\sinh(x) = \frac{e^x - e^{-x}}{2}$, $\cosh(x) = \frac{e^x + e^{-x}}{2}$ |
| **Inverse Hyperbolic** | `asinh(x)`, `acosh(x)`, `atanh(x)` | $\text{asinh}(x)$, $\text{acosh}(x)$, $\text{atanh}(x)$ | `acosh`: $x \ge 1$; `atanh`: $-1 < x < 1$ |
| **Logarithmic** | `log(x)`, `log10(x)`, `log2(x)` | $\ln(x)$ (base $e$), $\log_{10}(x)$, $\log_2(x)$ | Requires $x > 0$. ($x \le 0$ causes domain error `EDOM`). |
| **Exponential & Powers** | `pow(x, y)`, `exp(x)`, `exp2(x)` | $x^y$, $e^x$, $2^x$ | If $x < 0$, $y$ must be an integer. |
| **Roots** | `sqrt(x)`, `cbrt(x)`, `hypot(x, y)` | $\sqrt{x}$, $\sqrt[3]{x}$, $\sqrt{x^2 + y^2}$ | `sqrt` requires $x \ge 0$. `cbrt` accepts negative numbers. |
| **Rounding & Absolute** | `fabs(x)`, `ceil(x)`, `floor(x)`, `round(x)`, `trunc(x)` | $\|x\|$, $\lceil x \rceil$, $\lfloor x \rfloor$ | Floating-point rounding and absolute value. |
| **Remainder / Modulo** | `fmod(x, y)`, `remainder(x, y)` | $x \pmod y$ | Floating-point remainder. |
| **Combinatorics / Gamma** | `tgamma(x)` | $\Gamma(x)$ where $n! = \Gamma(n + 1)$ | Used for continuous factorial calculation. |

---

## 🚀 How to Run

### 1. Running the C Scientific Calculator
The C code is compiled into `scientific_calculator.exe`:
```powershell
# Run the executable
.\scientific_calculator.exe

# To recompile with GCC:
gcc -Wall -Wextra -std=c99 scientific_calculator.c -o scientific_calculator.exe -lm
```

### 2. Running the Web Application
Open [index.html](file:///d:/Anti%20gravity/index.html) in any web browser (Google Chrome, Microsoft Edge, Firefox, Brave):
```powershell
# Open directly in Windows default browser
Start-Process "d:\Anti gravity\index.html"
```
