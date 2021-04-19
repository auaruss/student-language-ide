/**
 * @fileoverview A3 from C211 at IU made into tests for our evaluator.
 * 
 * @author Alice Russell
 */

'use strict';

import { tIO } from './test-harness';

tIO(`; Exercise 1. (Unimplemented)
; Exercise 2. (Unimplemented)
; Exercise 3. (Unimplemented)

; Exercise 4.

; A Date is (make-date Number String Number).
; Examples:
;   (make-date 2018 "Sept" 12)
;   (make-date 0 "January" 1)
; Non-examples:
;   (make-date 2018 9 12)
;   "September 12, 2018"
(define-struct date (year month day))

; make-date: Number String Number -> Date
; date-year: Date -> Number
; date-month: Date -> String
; date-day: Date -> Number
; date? : Any -> Boolean

; An Address is (make-address String String String Number).
(define-struct address (street apartment city zip))

(define luddy (make-address "919 E 10th St" "" "Bloomington" 47408))
(define google (make-address "600 Amphitheatre Parkway" "" "Mountain View" 94043))
(define quest (make-address "8230 Walnut Hill Ln" "Bldg III Ste 400" "Dallas" 75231))
; Exercise 6.

; process-address: Address -> ...
(define (process-address a)
  (... (address-street a) ...
       (address-apartment a) ...
       (address-city a) ...
       (address-zip a) ...))

; Exercise 7.

; indiana? : Address -> Boolean
; Determines whether an address is in Indiana.
(define (indiana? a)
  (<= 46000 (address-zip a) 47999))

(check-expect (indiana? luddy) true)
(check-expect (indiana? google) false)
(check-expect (indiana? quest) false)

; Exercise 8.

; format-address: Address -> String
; Formats an address letter style.
(define (format-address a)
  (string-append (address-street a)
                 (if (string=? "" (address-street a))
                               ""
                               ", ")
                 (address-apartment a)
                 (if (string=? "" (address-apartment a))
                               ""
                               ", ")
                 (address-city a)
                 (if (string=? "" (address-city a))
                               ""
                               ", ")
                 (number->string (address-zip a))))


(check-expect (format-address luddy)
              "919 E 10th St, Bloomington, 47408")
(check-expect (format-address google)
              "600 Amphitheatre Parkway, Mountain View, 94043")
(check-expect (format-address quest)
              "8230 Walnut Hill Ln, Bldg III Ste 400, Dallas, 75231")

; Exercise 9.

; smaller-zip : Address Address -> Address
; Returns the address with the smaller zip code, ties arbitrarily go to the second address.
(define (smaller-zip a1 a2)
  (if (< (address-zip a1) (address-zip a2))
      a1
      a2))

(check-expect (smaller-zip luddy google) luddy)
(check-expect (smaller-zip google luddy) luddy)
(check-expect (smaller-zip luddy quest) luddy)
(check-expect (smaller-zip quest luddy) luddy)
(check-expect (smaller-zip quest google) quest)
(check-expect (smaller-zip google quest) quest)
(check-expect (smaller-zip google google) google)


; Exercise 83, 85 are unimplemented.

; An Editor is a structure:
;   (make-editor String String)
; interpretation (make-editor s t) describes an editor
; whose visible text is (string-append s t) with 
; the cursor displayed between s and t
(define-struct editor [pre post])

(define e1 (make-editor "hello" " world"))
(define e2 (make-editor "hell" " world"))
(define e3 (make-editor "hel" "l world"))
(define e4 (make-editor "" "smile"))
(define e5 (make-editor "frown" ""))
(define e6 (make-editor "frowny" ""))

; Exercise 84.

; edit: Editor KeyEvent -> Editor
; Changes an editor based on a keystroke.
(define (edit ed ke)
  (cond [(string=? ke "\b")
         (make-editor (substring (editor-pre ed) 0 (sub1 (string-length (editor-pre ed))))
                      (editor-post ed))]
        [(string=? ke "left")
         (if (= (string-length (editor-pre ed)) 0)
             ed
             (make-editor (substring (editor-pre ed) 0 (sub1 (string-length (editor-pre ed))))
                          (string-append
                           (substring (editor-pre ed) (sub1 (string-length (editor-pre ed))))
                           (editor-post ed))))]
        [(string=? ke "right")
         (if (= (string-length (editor-post ed)) 0)
             ed
             (make-editor (string-append
                           (editor-pre ed)
                           (substring (editor-post ed) 0 1))
                          (substring (editor-post ed) 1)))]
        [(or (string=? ke "\t")
             (string=? ke "\r")) ed]
        [(= (string-length ke) 1)
         (make-editor (string-append (editor-pre ed) ke)
                      (editor-post ed))]
        [else ed]))


(check-expect (edit e1 "\b") e2)
(check-expect (edit e2 "left") e3)
(check-expect (edit e3 "right") e2)
(check-expect (edit e4 "left") e4)
(check-expect (edit e5 "right") e5)
(check-expect (edit e5 "y") e6)
(check-expect (edit e5 "\t") e5)
(check-expect (edit e5 "\r") e5)
(check-expect (edit e5 "up") e5)`,
``);