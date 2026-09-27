/**
 * ============================================================================
 * Project: Scientific Calculator in C using <math.h>
 * Purpose: Complete implementation of scientific mathematical operations
 * Standards: C99 / C11
 * ============================================================================
 */

#define _USE_MATH_DEFINES // Expose M_PI, M_E on MSVC / MinGW
#include <stdio.h>
#include <stdlib.h>
#include <stdbool.h>
#include <math.h>
#include <errno.h>

// Fallback constant definitions in case compiler runs in strict ANSI mode
#ifndef M_PI
#define M_PI 3.14159265358979323846
#endif

#ifndef M_E
#define M_E 2.71828182845904523536
#endif

// Mode state: 0 = Degrees, 1 = Radians
static int angle_mode = 0; // default: 0 (Degrees)

// Utility: Angle conversions
double to_radians(double deg) {
    return deg * (M_PI / 180.0);
}

double to_degrees(double rad) {
    return rad * (180.0 / M_PI);
}

// Factorial function using iteration (safe for integers 0 <= n <= 20)
// and tgamma from math.h for general positive values
double compute_factorial(double n) {
    if (n < 0) {
        printf("Error: Factorial of negative number is undefined!\n");
        return NAN;
    }
    // For integer values <= 20, compute exact factorial
    if (floor(n) == n && n <= 20.0) {
        double result = 1.0;
        for (int i = 2; i <= (int)n; i++) {
            result *= i;
        }
        return result;
    }
    // Using tgamma from math.h: Gamma(n + 1) = n!
    return tgamma(n + 1.0);
}

// Clear input buffer to handle invalid character input
void flush_input(void) {
    int c;
    while ((c = getchar()) != '\n' && c != EOF);
}

// Display Angle Mode banner
void print_header(void) {
    printf("\n=======================================================\n");
    printf("           SCIENTIFIC CALCULATOR (math.h)              \n");
    printf("           Angle Mode: [%s]                           \n", 
           angle_mode == 0 ? "DEGREES" : "RADIANS");
    printf("=======================================================\n");
}

int main(void) {
    int choice;
    double a, b, result;

    while (1) {
        print_header();
        printf(" 1. Basic Arithmetic (+, -, *, /, %%)\n");
        printf(" 2. Trigonometric Functions (sin, cos, tan)\n");
        printf(" 3. Inverse Trigonometric Functions (asin, acos, atan)\n");
        printf(" 4. Hyperbolic Functions (sinh, cosh, tanh)\n");
        printf(" 5. Logarithmic Functions (ln, log10, log2)\n");
        printf(" 6. Exponential & Power Functions (x^y, e^x, 10^x)\n");
        printf(" 7. Roots & Reciprocal (sqrt, cbrt, 1/x)\n");
        printf(" 8. Factorial, Permutations & Combinations (n!, nPr, nCr)\n");
        printf(" 9. Rounding & Absolute Values (fabs, ceil, floor, round)\n");
        printf("10. Toggle Angle Mode (Degrees <-> Radians)\n");
        printf(" 0. Exit Calculator\n");
        printf("-------------------------------------------------------\n");
        printf("Enter your choice (0-10): ");

        if (scanf("%d", &choice) != 1) {
            printf("Invalid input. Please enter a valid number.\n");
            flush_input();
            continue;
        }

        if (choice == 0) {
            printf("\nExiting Scientific Calculator. Thank you!\n");
            break;
        }

        switch (choice) {
            case 1: { // Basic Arithmetic
                char op;
                printf("\nEnter operation (+, -, *, /, %%): ");
                scanf(" %c", &op);
                printf("Enter two numbers: ");
                if (scanf("%lf %lf", &a, &b) != 2) {
                    printf("Invalid input!\n");
                    flush_input();
                    break;
                }

                switch (op) {
                    case '+': result = a + b; printf("Result: %.8g\n", result); break;
                    case '-': result = a - b; printf("Result: %.8g\n", result); break;
                    case '*': result = a * b; printf("Result: %.8g\n", result); break;
                    case '/':
                        if (b == 0.0) {
                            printf("Error: Division by zero is undefined!\n");
                        } else {
                            result = a / b;
                            printf("Result: %.8g\n", result);
                        }
                        break;
                    case '%':
                        // fmod(x, y) from math.h for floating point modulo
                        if (b == 0.0) {
                            printf("Error: Modulo by zero is undefined!\n");
                        } else {
                            result = fmod(a, b);
                            printf("fmod(%.4g, %.4g) = %.8g\n", a, b, result);
                        }
                        break;
                    default:
                        printf("Unknown operator '%c'.\n", op);
                }
                break;
            }

            case 2: { // Trigonometric
                int sub;
                printf("\n--- Trigonometric Functions ---\n");
                printf("1. sin(x)\n2. cos(x)\n3. tan(x)\n");
                printf("Select function (1-3): ");
                scanf("%d", &sub);
                printf("Enter angle x (%s): ", angle_mode == 0 ? "degrees" : "radians");
                scanf("%lf", &a);

                double rad = (angle_mode == 0) ? to_radians(a) : a;

                if (sub == 1) {
                    result = sin(rad);
                    printf("sin(%.4g) = %.8g\n", a, result);
                } else if (sub == 2) {
                    result = cos(rad);
                    printf("cos(%.4g) = %.8g\n", a, result);
                } else if (sub == 3) {
                    // Check for tan asymptote (cos(rad) approx 0)
                    if (fabs(cos(rad)) < 1e-15) {
                        printf("Error: tan(%.4g) is undefined (asymptote)!\n", a);
                    } else {
                        result = tan(rad);
                        printf("tan(%.4g) = %.8g\n", a, result);
                    }
                } else {
                    printf("Invalid trigonometric choice!\n");
                }
                break;
            }

            case 3: { // Inverse Trigonometric
                int sub;
                printf("\n--- Inverse Trigonometric Functions ---\n");
                printf("1. asin(x) [Arc Sine]\n2. acos(x) [Arc Cosine]\n3. atan(x) [Arc Tangent]\n");
                printf("Select function (1-3): ");
                scanf("%d", &sub);
                printf("Enter value x: ");
                scanf("%lf", &a);

                if (sub == 1) {
                    if (a < -1.0 || a > 1.0) {
                        printf("Domain Error: asin(x) is only defined for -1 <= x <= 1.\n");
                    } else {
                        result = asin(a);
                        if (angle_mode == 0) result = to_degrees(result);
                        printf("asin(%.4g) = %.8g %s\n", a, result, angle_mode == 0 ? "deg" : "rad");
                    }
                } else if (sub == 2) {
                    if (a < -1.0 || a > 1.0) {
                        printf("Domain Error: acos(x) is only defined for -1 <= x <= 1.\n");
                    } else {
                        result = acos(a);
                        if (angle_mode == 0) result = to_degrees(result);
                        printf("acos(%.4g) = %.8g %s\n", a, result, angle_mode == 0 ? "deg" : "rad");
                    }
                } else if (sub == 3) {
                    result = atan(a);
                    if (angle_mode == 0) result = to_degrees(result);
                    printf("atan(%.4g) = %.8g %s\n", a, result, angle_mode == 0 ? "deg" : "rad");
                } else {
                    printf("Invalid inverse trigonometric choice!\n");
                }
                break;
            }

            case 4: { // Hyperbolic
                int sub;
                printf("\n--- Hyperbolic Functions ---\n");
                printf("1. sinh(x)\n2. cosh(x)\n3. tanh(x)\n");
                printf("Select function (1-3): ");
                scanf("%d", &sub);
                printf("Enter value x: ");
                scanf("%lf", &a);

                if (sub == 1) {
                    result = sinh(a);
                    printf("sinh(%.4g) = %.8g\n", a, result);
                } else if (sub == 2) {
                    result = cosh(a);
                    printf("cosh(%.4g) = %.8g\n", a, result);
                } else if (sub == 3) {
                    result = tanh(a);
                    printf("tanh(%.4g) = %.8g\n", a, result);
                } else {
                    printf("Invalid choice!\n");
                }
                break;
            }

            case 5: { // Logarithmic
                int sub;
                printf("\n--- Logarithmic Functions ---\n");
                printf("1. ln(x)   [Natural log, base e]\n");
                printf("2. log10(x) [Common log, base 10]\n");
                printf("3. log2(x)  [Binary log, base 2]\n");
                printf("Select function (1-3): ");
                scanf("%d", &sub);
                printf("Enter value x: ");
                scanf("%lf", &a);

                if (a <= 0.0) {
                    printf("Domain Error: Logarithms are only defined for x > 0.\n");
                } else {
                    if (sub == 1) {
                        result = log(a); // natural log in C
                        printf("ln(%.4g) = %.8g\n", a, result);
                    } else if (sub == 2) {
                        result = log10(a);
                        printf("log10(%.4g) = %.8g\n", a, result);
                    } else if (sub == 3) {
                        result = log2(a);
                        printf("log2(%.4g) = %.8g\n", a, result);
                    } else {
                        printf("Invalid choice!\n");
                    }
                }
                break;
            }

            case 6: { // Exponential & Power
                int sub;
                printf("\n--- Exponential & Power Functions ---\n");
                printf("1. pow(x, y) [x raised to power y]\n");
                printf("2. exp(x)    [e^x]\n");
                printf("3. 10^x      [Power of 10]\n");
                printf("Select function (1-3): ");
                scanf("%d", &sub);

                if (sub == 1) {
                    printf("Enter base x and exponent y: ");
                    scanf("%lf %lf", &a, &b);
                    if (a < 0 && floor(b) != b) {
                        printf("Domain Error: Negative base with non-integer exponent produces a complex number.\n");
                    } else if (a == 0 && b < 0) {
                        printf("Error: 0 raised to a negative power is undefined (division by zero).\n");
                    } else {
                        result = pow(a, b);
                        printf("%.4g ^ %.4g = %.8g\n", a, b, result);
                    }
                } else if (sub == 2) {
                    printf("Enter exponent x: ");
                    scanf("%lf", &a);
                    result = exp(a);
                    printf("e^(%.4g) = %.8g\n", a, result);
                } else if (sub == 3) {
                    printf("Enter exponent x: ");
                    scanf("%lf", &a);
                    result = pow(10.0, a);
                    printf("10^(%.4g) = %.8g\n", a, result);
                } else {
                    printf("Invalid choice!\n");
                }
                break;
            }

            case 7: { // Roots & Reciprocal
                int sub;
                printf("\n--- Roots & Reciprocal ---\n");
                printf("1. sqrt(x) [Square root]\n");
                printf("2. cbrt(x) [Cube root]\n");
                printf("3. 1/x     [Reciprocal]\n");
                printf("Select function (1-3): ");
                scanf("%d", &sub);
                printf("Enter value x: ");
                scanf("%lf", &a);

                if (sub == 1) {
                    if (a < 0.0) {
                        printf("Domain Error: sqrt(x) requires x >= 0.\n");
                    } else {
                        result = sqrt(a);
                        printf("sqrt(%.4g) = %.8g\n", a, result);
                    }
                } else if (sub == 2) {
                    result = cbrt(a); // cbrt in math.h handles negative numbers too!
                    printf("cbrt(%.4g) = %.8g\n", a, result);
                } else if (sub == 3) {
                    if (a == 0.0) {
                        printf("Error: Division by zero!\n");
                    } else {
                        result = 1.0 / a;
                        printf("1/(%.4g) = %.8g\n", a, result);
                    }
                } else {
                    printf("Invalid choice!\n");
                }
                break;
            }

            case 8: { // Factorial, Permutation & Combination
                int sub;
                printf("\n--- Combinatorics & Factorial ---\n");
                printf("1. n!  [Factorial]\n");
                printf("2. nPr [Permutations: n! / (n-r)!]\n");
                printf("3. nCr [Combinations: n! / (r! * (n-r)!)]\n");
                printf("Select function (1-3): ");
                scanf("%d", &sub);

                if (sub == 1) {
                    printf("Enter n: ");
                    scanf("%lf", &a);
                    result = compute_factorial(a);
                    if (!isnan(result)) {
                        printf("%.4g! = %.8g\n", a, result);
                    }
                } else if (sub == 2 || sub == 3) {
                    int n, r;
                    printf("Enter n and r (integers, n >= r >= 0): ");
                    scanf("%d %d", &n, &r);
                    if (n < 0 || r < 0 || r > n) {
                        printf("Error: Must satisfy n >= r >= 0!\n");
                    } else {
                        double fact_n = compute_factorial(n);
                        double fact_nmr = compute_factorial(n - r);
                        if (sub == 2) {
                            result = fact_n / fact_nmr;
                            printf("%dP%d = %.0f\n", n, r, result);
                        } else {
                            double fact_r = compute_factorial(r);
                            result = fact_n / (fact_r * fact_nmr);
                            printf("%dC%d = %.0f\n", n, r, result);
                        }
                    }
                } else {
                    printf("Invalid choice!\n");
                }
                break;
            }

            case 9: { // Rounding & Absolute
                int sub;
                printf("\n--- Rounding & Absolute Functions ---\n");
                printf("1. fabs(x)  [Absolute Value |x|]\n");
                printf("2. ceil(x)  [Ceiling: smallest integer >= x]\n");
                printf("3. floor(x) [Floor: largest integer <= x]\n");
                printf("4. round(x) [Round to nearest integer]\n");
                printf("Select function (1-4): ");
                scanf("%d", &sub);
                printf("Enter value x: ");
                scanf("%lf", &a);

                if (sub == 1) {
                    result = fabs(a);
                    printf("|%.4g| = %.8g\n", a, result);
                } else if (sub == 2) {
                    result = ceil(a);
                    printf("ceil(%.4g) = %.0f\n", a, result);
                } else if (sub == 3) {
                    result = floor(a);
                    printf("floor(%.4g) = %.0f\n", a, result);
                } else if (sub == 4) {
                    result = round(a);
                    printf("round(%.4g) = %.0f\n", a, result);
                } else {
                    printf("Invalid choice!\n");
                }
                break;
            }

            case 10: { // Toggle Angle Mode
                angle_mode = (angle_mode == 0) ? 1 : 0;
                printf("\nAngle mode switched to: [%s]\n", 
                       angle_mode == 0 ? "DEGREES" : "RADIANS");
                break;
            }

            default:
                printf("\nInvalid selection. Please choose an option from 0 to 10.\n");
                break;
        }

        printf("\nPress Enter to continue...");
        flush_input();
        getchar();
    }

    return 0;
}
