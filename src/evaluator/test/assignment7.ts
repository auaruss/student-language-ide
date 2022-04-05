'use strict';

import { tIO } from './test-harness';

export const a7Tests = (): void => {
 
tIO(`
; Exercise 4.

; A 1String a String of length 1

; rot13 : 1String -> 1String
; returns the letter 13 spaces ahead in the alphabet
(define (rot13 letter)
  (cond
    [(or (and (string<=? "a" letter) (string<=? letter "m"))
         (and (string<=? "A" letter) (string<=? letter "M")))
     (int->string (+ (string->int letter) 13))]
    [(or (and (string<=? "n" letter) (string<=? letter "z"))
         (and (string<=? "N" letter) (string<=? letter "Z")))
     (int->string (- (string->int letter) 13))]
    [else letter]))

(check-expect (rot13 "a") "n")
(check-expect (rot13 "A") "N")
(check-expect (rot13 "o") "b")
(check-expect (rot13 "O") "B")
(check-expect (rot13 "2") "2")

; Exercise 5.

; A ListOf1Strings is one of:
; - empty
; - (cons 1String ListOf1Strings)

(define lo-1strings-1 empty)
(define lo-1strings-2 (cons "a" (cons "2" (cons "L" empty))))
(define lo-1strings-3 (list "λ" "x" "." "x" " " "x"))

; process-list-of-1-strings: ListOf1Strings -> ...
; ...
(define (process-list-of-1-strings lo1s)
  (cond [(empty? lo1s) ...]
        [(cons? lo1s) (... (first lo1s)
                           (process-list-of-1-strings (rest lo1s)))]))
        
; Exercise 6.


; combine-1strings: ListOf1Strings -> String
; Takes a ListOf1Strings and returns it as a single String. 
(define (combine-1strings lo1s)
  (cond [(empty? lo1s) ""]
        [(cons? lo1s) (string-append (first lo1s)
                           (combine-1strings (rest lo1s)))]))

(check-expect (combine-1strings lo-1strings-1) "")
(check-expect (combine-1strings lo-1strings-2) "a2L")
(check-expect (combine-1strings lo-1strings-3) "λx.x x")

; Exercise 7.

(define secret-message-1
  "Zrrg zr ng zvqavtug.")
(define secret-message-2
  "Pbatengf ba qrpelcgvat guvf zrffntr! Lbh ner njrfbzr.")
(define secret-message-3
  "Pbzchgre fpvrapr vf njrfbzr. Qba'g lbh nterr?")
(define secret-message-4
  "Bapr hcba n gvzr, n ybat gvzr ntb, gurer jnf n pbzchgre fpvrapr fghqrag,
nyy ybaryl naq jvgu ab cynpr gb tb.
Ohg gura gurl qvfpbirerq P211 naq sbhaq gung vg jnf urnira.
Guvf qrfpevorf zr, ohg V ubcr vg'f gur jnl lbh'yy pbzr gb or.")
(define secret-message-5
  "Pbzchgre fpvrapr vf njrfbzr. Qba'g lbh nterr?")

; Exercise 8.

; convert-to-r13: ListOf1String -> ListOf1String
; Takes a ListOf1Strings and returns a ListOf1Strings with each 1String
; in the list converted to its rotated representation.
(define (convert-to-r13 lo1s)
  (cond [(empty? lo1s) lo1s]
        [(cons? lo1s)
         (cons (rot13 (first lo1s))
               (convert-to-r13 (rest lo1s)))]))

(check-expect (convert-to-r13 empty) empty)
(check-expect (convert-to-r13 (explode secret-message-1))
              (explode "Meet me at midnight."))

; Exercise 9-10 (skipped/modified file i/o parts of the exercises)

; decrypt-message: String -> String
; Takes a String (a rotated encrypted message) and returns a
; single String converted to its decrypted representation.
(define (decrypt-message s)
  (combine-1strings (convert-to-r13 (explode s))))

(check-expect (decrypt-message secret-message-1)
              "Meet me at midnight.")
(check-expect (decrypt-message secret-message-2)
              "Congrats on decrypting this message! You are awesome.")
(check-expect (decrypt-message secret-message-3)
              "Computer science is awesome. Don't you agree?")
(check-expect (decrypt-message secret-message-4)
              "Once upon a time, a long time ago, there was a computer science student,
all lonely and with no place to go.
But then they discovered C211 and found that it was heaven.
This describes me, but I hope it's the way you'll come to be.")


; Exercise 11.

; encrypt-string: String -> String
; Takes a String (a message) and returns a
; single String converted to its encrypted rotated representation.
(define (encrypt-string s)
  (decrypt-message s)) ; works only for rot13, since each rotation
                       ; is halfway through the alphabet.

(check-expect (encrypt-string (encrypt-string secret-message-1))
              secret-message-1)
(check-expect (encrypt-string (encrypt-string secret-message-2))
              secret-message-2)
(check-expect (encrypt-string (encrypt-string secret-message-3))
              secret-message-3)
(check-expect (encrypt-string (encrypt-string secret-message-4))
              secret-message-4)

; Exercise 13.

; remove-<=100: ListOfNumbers -> ListOfNumbers
; Takes a ListOfNumbers and removes every number less than or equal to 100.
(define (remove-<=100 lon)
  (cond [(empty? lon) empty]
        [(cons? lon) (if (< (first lon) 100)
                         (remove-<=100 (rest lon))
                         (cons (first lon)
                               (remove-<=100 (rest lon))))]))

(check-expect (remove-<=100 (list 1 2 3 100 200 300 4)) (list 100 200 300))
(check-expect (remove-<=100 (list)) empty)

; Exercise 14.

; A Frequency is (make-frequency String Number).
(define-struct frequency (word count))

; Exercise 15.

; A ListOfStrings is one of:
; - empty
; - (cons String ListOfStrings)

; A ListOfFrequencies is one of:
; - empty
; - (cons String ListOfFrequencies)

(define lof1
  (cons (make-frequency "hi" 5)
      (cons (make-frequency "hello" 4)
            (cons (make-frequency "bye" 2)
                  empty))))

(define lof2
  (cons (make-frequency "him" 5)
      (cons (make-frequency "helqelo" 42)
            (cons (make-frequency "byeasda" 8)
                  empty))))

; Exercise 16.

; count-word: ListOfFrequencies String -> ListOfFrequencies
; Consumes a ListOfFrequencies and a String and adds 1 to
; the frequency for that string, producing a new ListOfFrequencies.
(define (count-word lof s)
  (cond [(empty? lof) (list (make-frequency s 1))]
        [(cons? lof) (if (string=? (frequency-word (first lof)) s)
                         (cons (make-frequency (frequency-word (first lof))
                                               (add1 (frequency-count (first lof))))
                               (rest lof))
                         (cons (first lof)
                               (count-word (rest lof) s)))]))

(check-expect (count-word empty "apple")
              (list (make-frequency "apple" 1)))
(check-expect (count-word lof1 "apple")
              (append lof1 (list (make-frequency "apple" 1))))
(check-expect (count-word lof1 "hi")
              (list (make-frequency "hi" 6)
                    (make-frequency "hello" 4)
                    (make-frequency "bye" 2)))
(check-expect (count-word lof1 "hello")
              (list (make-frequency "hi" 5)
                    (make-frequency "hello" 5)
                    (make-frequency "bye" 2)))
(check-expect (count-word lof1 "bye")
              (list (make-frequency "hi" 5)
                    (make-frequency "hello" 4)
                    (make-frequency "bye" 3)))

; count-all-words: ListOfStrings -> ListOfFrequencies
; Takes a ListOfStrings and produces a ListOfFrequencies
; with the frequencies counted from the entire list of strings.
(define (count-all-words los)
  (cond [(empty? los) empty]
        [(cons? los)
         (count-word (count-all-words (rest los)) (first los))]))

(check-expect (count-all-words
               (list "hello" "world" "hello" "world" "this" "is" "a" "list" "of"
                     "a" "set" "of" "words"))
              (list (make-frequency "words" 1)
                    (make-frequency "of" 2)
                    (make-frequency "set" 1)
                    (make-frequency "a" 2)
                    (make-frequency "list" 1)
                    (make-frequency "is" 1)
                    (make-frequency "this" 1)
                    (make-frequency "world" 2)
                    (make-frequency "hello" 2)))

; Exercise 17.

; frequents: ListOfFrequencies -> ListOfFrequencies
; Consumes a ListOfFrequencies and produces a ListOfFrequencies that
; contains only the Frequencys from the original list where the number
; is more than 100.
(define (frequents lof)
  (cond [(empty? lof) empty]
        [(cons? lof) (if (< (frequency-count (first lof)) 100)
                         (frequents (rest lof))
                         (cons (first lof)
                               (frequents (rest lof))))]))



(check-expect (frequents (list (make-frequency "words" 1)
                               (make-frequency "of" 2)
                               (make-frequency "set" 1)
                               (make-frequency "a" 2)
                               (make-frequency "list" 231)
                               (make-frequency "is" 211)
                               (make-frequency "this" 1)
                               (make-frequency "world" 442)
                               (make-frequency "hello" 443)))
              (list (make-frequency "list" 231)
                    (make-frequency "is" 211)
                    (make-frequency "world" 442)
                    (make-frequency "hello" 443)))
`, 
``);

}
