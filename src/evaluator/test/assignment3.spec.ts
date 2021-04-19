/**
 * @fileoverview A3 from C211 at IU made into tests for our evaluator.
 * 
 * @author Alice Russell
 */

'use strict';

import { tIO } from './test-harness';

tIO(`; A Year is a non-negative integer
; Examples:
;   0
;   1789
;   2018
; Non-examples:
;   -5000
;   "AD 2018"
 
; A Month is one of:
; - "January"
; - "February"
; - "March"
; - "April"
; - "May"
; - "June"
; - "July"
; - "August"
; - "September"
; - "October"
; - "November"
; - "December"

; Exercise 1

; A Day is an integer at least 1 but at most 31
; Examples:
;   1
;   10
;   31
; Non-examples:
;   32
;   "today"

; A MonthFormat is one of:
; - "long"
; - "short"
 
; A DateOrder is one of:
; - "MDY"
; - "DMY"

; DaysInYear is one of:
; - an integer at least   0 but less than  31
; - an integer at least  31 but less than  59
; - an integer at least  59 but less than  90
; - an integer at least  90 but less than 120
; - an integer at least 120 but less than 151
; - an integer at least 151 but less than 181
; - an integer at least 181 but less than 212
; - an integer at least 212 but less than 243
; - an integer at least 243 but less than 273
; - an integer at least 273 but less than 304
; - an integer at least 304 but less than 334
; - an integer at least 334 but less than 365
; *Interpretation*: the number of elapsed days
;                   since the first day of the year
 
; DaysInMonth is an integer at least 0 but less than 31
; *Interpretation*: The number of elapsed days
;                   since the first day of the month


; Exercise 1.

; next-month : Month -> Month
; returns the month that comes after the given one
(define (next-month m)
  (cond [(string=? m "January") "February"]
        [(string=? m "February") "March"]
        [(string=? m "March") "April"]
        [(string=? m "April") "May"]
        [(string=? m "May") "June"]
        [(string=? m "June") "July"]
        [(string=? m "July") "August"]
        [(string=? m "August") "September"]
        [(string=? m "September") "October"]
        [(string=? m "October") "November"]
        [(string=? m "November") "December"]
        [(string=? m "December") "January"]))

(check-expect (next-month "January") "February")
(check-expect (next-month "February") "March")
(check-expect (next-month "March") "April")
(check-expect (next-month "April") "May")
(check-expect (next-month "May") "June")
(check-expect (next-month "June") "July")
(check-expect (next-month "July") "August")
(check-expect (next-month "August") "September")
(check-expect (next-month "September") "October")
(check-expect (next-month "October") "November")
(check-expect (next-month "November") "December")
(check-expect (next-month "December") "January")

; Exercise 2.

; fall? : Month -> Boolean
; decides whether the given month is between September and November

(define (fall? m)
  (cond [(string=? m "January") false]
        [(string=? m "February") false]
        [(string=? m "March") false]
        [(string=? m "April") false]
        [(string=? m "May") false]
        [(string=? m "June") false]
        [(string=? m "July") false]
        [(string=? m "August") false]
        [(string=? m "September") true]
        [(string=? m "October") true]
        [(string=? m "November") true]
        [(string=? m "December") false]))

(check-expect (fall? "January") false)
(check-expect (fall? "February") false)
(check-expect (fall? "March") false)
(check-expect (fall? "April") false)
(check-expect (fall? "May") false)
(check-expect (fall? "June") false)
(check-expect (fall? "July") false)
(check-expect (fall? "August") false)
(check-expect (fall? "September") true)
(check-expect (fall? "October") true)
(check-expect (fall? "November") true)
(check-expect (fall? "December") false)

; Exercise 3.

; format-month : Month MonthFormat -> String
; abbreviates Month to three letters or not
(define (format-month m f)
  (cond [(string=? "long" f) m]
        [(string=? "short" f) (substring m 0 3)]))
 
(check-expect (format-month "November" "long") "November")
(check-expect (format-month "November" "short") "Nov")

; Exercise 4.

; year-month-day->date : Year Month Day DateOrder MonthFormat -> String
; produces a date as a string
; given: 1936 "November" 12 "MDY" "long"   expect: "November 12, 1936"
; given: 1936 "November" 12 "MDY" "short"  expect: "Nov 12, 1936"
; given: 1936 "November" 12 "DMY" "long"   expect: "12 November 1936"
; given: 1936 "November" 12 "DMY" "short"  expect: "12 Nov 1936"
(define (year-month-day->date y m d o f)
  (cond [(string=? o "MDY")
         (string-append (format-month m f) " " (number->string d) ", " (number->string y))]
        [(string=? o "DMY")
         (string-append (number->string d) " " (format-month m f) " " (number->string y))]))

(check-expect (year-month-day->date 1936 "November" 12 "MDY" "long")
              "November 12, 1936")
(check-expect (year-month-day->date 1936 "November" 12 "MDY" "short")
              "Nov 12, 1936")
(check-expect (year-month-day->date 1936 "November" 12 "DMY" "long")
              "12 November 1936")
(check-expect (year-month-day->date 1936 "November" 12 "DMY" "short")
              "12 Nov 1936")

; Exercise 5. Unimplemented image exercise.

; Exercise 6.

; month->days-in-year : Month -> Number
; returns the days elapsed in the year before the given month
; given: "January"    expect: 0
; given: "September"  expect: 243
(define (month->days-in-year m)
  (cond [(string=? m "January") 0]
        [(string=? m "February") 31]
        [(string=? m "March") 59]
        [(string=? m "April") 90]
        [(string=? m "May") 120]
        [(string=? m "June") 151]
        [(string=? m "July") 181]
        [(string=? m "August") 212]
        [(string=? m "September") 243]
        [(string=? m "October") 273]
        [(string=? m "November") 304]
        [(string=? m "December") 334]))


(check-expect (month->days-in-year "January") 0)
(check-expect (month->days-in-year "February") 31)
(check-expect (month->days-in-year "March") 59)
(check-expect (month->days-in-year "April") 90)
(check-expect (month->days-in-year "May") 120)
(check-expect (month->days-in-year "June") 151)
(check-expect (month->days-in-year "July") 181)
(check-expect (month->days-in-year "August") 212)
(check-expect (month->days-in-year "September") 243)
(check-expect (month->days-in-year "October") 273)
(check-expect (month->days-in-year "November") 304)
(check-expect (month->days-in-year "December") 334)

; Exercise 7.

; year-month-day->days : Year Month Day -> Number
; returns the number of days elapsed since January 1, 0
; given: 0 "January" 1     expect: 0
; given: 2017 "August" 28  expect: 736444
(define (year-month-day->days y m d)
  (+ (* 365 y) (month->days-in-year m) (- d 1)))


(check-expect (year-month-day->days 0 "January" 1) 0)
(check-expect (year-month-day->days 2017 "August" 28) 736444)

; Exercise 8.

; days-between : Year Month Day Year Month Day -> Number
(define (days-between y1 m1 d1 y2 m2 d2)
  (abs (- (year-month-day->days y1 m1 d1)
          (year-month-day->days y2 m2 d2))))

(check-expect (days-between 2021 "April" 17 2021 "April" 19) 2)
(check-expect (days-between 2021 "April" 18 2020 "April" 18) 365)
(check-expect (days-between 2021 "April" 18 2021 "May" 18) 30)

; Exercise 9.

; days->year : Number -> Year
; takes days since 1 Jan 0 and returns the year
; given: 364                                       expect: 0
; given: 365                                       expect: 1
; given: 736305                                    expect: 2017
; given: (year-month-day->days 1999 "December" 31) expect: 1999
(define (days->year d)
  (floor (/ d 365)))
  

(check-expect (days->year 364) 0)
(check-expect (days->year 365) 1)
(check-expect (days->year 736305) 2017)
(check-expect (days->year (year-month-day->days 1999 "December" 31)) 1999)

; Exercise 10.

; days-in-year->month : DaysInYear -> Month
; takes days since the first of the year and returns the month
; given: 0    expect: "January"
; given: 31   expect: "February"
; given: 242  expect: "August"
(define (days-in-year->month d)
  (cond [(and (<= 0 d) (> 31 d)) "January"]
        [(and (<= 31 d) (> 59 d)) "February"]
        [(and (<= 59 d) (> 90 d)) "March"]
        [(and (<= 90 d) (> 120 d)) "April"]
        [(and (<= 120 d) (> 151 d)) "May"]
        [(and (<= 151 d) (> 181 d)) "June"]
        [(and (<= 181 d) (> 212 d)) "July"]
        [(and (<= 212 d) (> 243 d)) "August"]
        [(and (<= 243 d) (> 273 d)) "September"]
        [(and (<= 273 d) (> 304 d)) "October"]
        [(and (<= 304 d) (> 334 d)) "November"]
        [(and (<= 334 d) (> 365 d)) "December"]))

(check-expect (days-in-year->month 0)   "January")
(check-expect (days-in-year->month 31)  "February")
(check-expect (days-in-year->month 60)  "March")
(check-expect (days-in-year->month 99)  "April")
(check-expect (days-in-year->month 150) "May")
(check-expect (days-in-year->month 160) "June")
(check-expect (days-in-year->month 190) "July")
(check-expect (days-in-year->month 220) "August")
(check-expect (days-in-year->month 250) "September")
(check-expect (days-in-year->month 280) "October")
(check-expect (days-in-year->month 310) "November")
(check-expect (days-in-year->month 340) "December")

; days->month : Number -> Month
; takes days since 1 Jan 0 and returns the month
; given: 59                                        expect: "March"
; given: 364                                       expect: "December"
; given: 736445                                    expect: "August"
; given: (year-month-day->days 1999 "December" 31) expect: "December"
(define (days->month d)
  (days-in-year->month (modulo d 365)))

(check-expect (days->month 59) "March")
(check-expect (days->month 364) "December")
(check-expect (days->month 736445) "August")
(check-expect (days->month (year-month-day->days 1999 "December" 31)) "December")

; Exercise 11.

; days-in-year->days-in-month : DaysInYear -> DaysInMonth
; takes days since the first of the year
; and returns days since the first of the month
; given: 0       expect: 0
; given: 59      expect: 0
; given: 364     expect: 30
(define (days-in-year->days-in-month d)
  (cond [(and (<= 0 d) (> 31 d)) (- d 0)]
        [(and (<= 31 d) (> 59 d)) (- d 31)]
        [(and (<= 59 d) (> 90 d)) (- d 59)]
        [(and (<= 90 d) (> 120 d)) (- d 90)]
        [(and (<= 120 d) (> 151 d)) (- d 120)]
        [(and (<= 151 d) (> 181 d)) (- d 151)]
        [(and (<= 181 d) (> 212 d)) (- d 181)]
        [(and (<= 212 d) (> 243 d)) (- d 212)]
        [(and (<= 243 d) (> 273 d)) (- d 243)]
        [(and (<= 273 d) (> 304 d)) (- d 273)]
        [(and (<= 304 d) (> 334 d)) (- d 304)]
        [(and (<= 334 d) (> 365 d)) (- d 334)]))

(check-expect (days-in-year->days-in-month 0)   0)
(check-expect (days-in-year->days-in-month 35)  4)
(check-expect (days-in-year->days-in-month 59)  0)
(check-expect (days-in-year->days-in-month 99)  9)
(check-expect (days-in-year->days-in-month 124) 4)
(check-expect (days-in-year->days-in-month 160) 9)
(check-expect (days-in-year->days-in-month 190) 9)
(check-expect (days-in-year->days-in-month 212) 0)
(check-expect (days-in-year->days-in-month 250) 7)
(check-expect (days-in-year->days-in-month 280) 7)
(check-expect (days-in-year->days-in-month 310) 6)
(check-expect (days-in-year->days-in-month 364) 30)
 
; days->day : Number -> Day
; takes days since 1 Jan 0 and returns the day of the month
; given: 0                                         expect: 1
; given: 59                                        expect: 1
; given: 736324                                    expect: 30
; given: (year-month-day->days 1999 "December" 31) expect: 31
(define (days->day d)
  (add1 (days-in-year->days-in-month (modulo d 365))))

(check-expect (days->day 0) 1)
(check-expect (days->day 59) 1)
(check-expect (days->day 736324) 30)
(check-expect (days->day (year-month-day->days 1999 "December" 31)) 31)

; Exercise 12.

; first-day : Number
; The number of days elapsed on January 18, 2021 since January 1, 0
(define first-day (year-month-day->days 2021 "January" 18))
 
; length-of-semester : Number
; The number of days elapsed on May 7, 2021 since January 18, 2021
(define length-of-semester (days-between 2021 "May" 7 2021 "January" 18))
`, 
`Defined (next-month m) to be (cond [(string=? m January) February][(string=? m February) March][(string=? m March) April][(string=? m April) May][(string=? m May) June][(string=? m June) July][(string=? m July) August][(string=? m August) September][(string=? m September) October][(string=? m October) November][(string=? m November) December][(string=? m December) January]).
🎉
🎉
🎉
🎉
🎉
🎉
🎉
🎉
🎉
🎉
🎉
🎉
Defined (fall? m) to be (cond [(string=? m January) false][(string=? m February) false][(string=? m March) false][(string=? m April) false][(string=? m May) false][(string=? m June) false][(string=? m July) false][(string=? m August) false][(string=? m September) true][(string=? m October) true][(string=? m November) true][(string=? m December) false]).
🎉
🎉
🎉
🎉
🎉
🎉
🎉
🎉
🎉
🎉
🎉
🎉
Defined (format-month m f) to be (cond [(string=? long f) m][(string=? short f) (substring m 0 3)]).
🎉
🎉
Defined (year-month-day->date y m d o f) to be (cond [(string=? o MDY) (string-append (format-month m f)   (number->string d) ,  (number->string y))][(string=? o DMY) (string-append (number->string d)   (format-month m f)   (number->string y))]).
(number->string d): Expression undefined in program
(number->string d): Expression undefined in program
(number->string d): Expression undefined in program
(number->string d): Expression undefined in program
Defined (month->days-in-year m) to be (cond [(string=? m January) 0][(string=? m February) 31][(string=? m March) 59][(string=? m April) 90][(string=? m May) 120][(string=? m June) 151][(string=? m July) 181][(string=? m August) 212][(string=? m September) 243][(string=? m October) 273][(string=? m November) 304][(string=? m December) 334]).
🎉
🎉
🎉
🎉
🎉
🎉
🎉
🎉
🎉
🎉
🎉
🎉
Defined (year-month-day->days y m d) to be (+ (* 365 y) (month->days-in-year m) (- d 1)).
🎉
🎉
Defined (days-between y1 m1 d1 y2 m2 d2) to be (abs (- (year-month-day->days y1 m1 d1) (year-month-day->days y2 m2 d2))).
🎉
🎉
🎉
Defined (days->year d) to be (floor (/ d 365)).
🎉
🎉
🎉
🎉
Defined (days-in-year->month d) to be (cond [(and (<= 0 d) (> 31 d)) January][(and (<= 31 d) (> 59 d)) February][(and (<= 59 d) (> 90 d)) March][(and (<= 90 d) (> 120 d)) April][(and (<= 120 d) (> 151 d)) May][(and (<= 151 d) (> 181 d)) June][(and (<= 181 d) (> 212 d)) July][(and (<= 212 d) (> 243 d)) August][(and (<= 243 d) (> 273 d)) September][(and (<= 273 d) (> 304 d)) October][(and (<= 304 d) (> 334 d)) November][(and (<= 334 d) (> 365 d)) December]).
🎉
🎉
🎉
🎉
🎉
🎉
🎉
🎉
🎉
🎉
🎉
🎉
Defined (days->month d) to be (days-in-year->month (modulo d 365)).
🎉
🎉
🎉
🎉
Defined (days-in-year->days-in-month d) to be (cond [(and (<= 0 d) (> 31 d)) (- d 0)][(and (<= 31 d) (> 59 d)) (- d 31)][(and (<= 59 d) (> 90 d)) (- d 59)][(and (<= 90 d) (> 120 d)) (- d 90)][(and (<= 120 d) (> 151 d)) (- d 120)][(and (<= 151 d) (> 181 d)) (- d 151)][(and (<= 181 d) (> 212 d)) (- d 181)][(and (<= 212 d) (> 243 d)) (- d 212)][(and (<= 243 d) (> 273 d)) (- d 243)][(and (<= 273 d) (> 304 d)) (- d 273)][(and (<= 304 d) (> 334 d)) (- d 304)][(and (<= 334 d) (> 365 d)) (- d 334)]).
🎉
🎉
🎉
🎉
🎉
🎉
🎉
🎉
🎉
🎉
🎉
🎉
Defined (days->day d) to be (add1 (days-in-year->days-in-month (modulo d 365))).
🎉
🎉
🎉
🎉
Defined first-day to be 737682.
Defined length-of-semester to be 109.
`);