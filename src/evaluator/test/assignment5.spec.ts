/**
 * @fileoverview A4 from C211 at IU made into tests for our evaluator.
 * 
 * @author Alice Russell
 */

 'use strict';

 import { tIO } from './test-harness';
 
 export const a5Tests = (): void => {
 
tIO(`; A Show is one of:
; - (make-movie String Number Number)
; - (make-sitcom String Number Number)
(define-struct movie (title year minutes))
(define-struct sitcom (series season episode))

(define show1 (make-movie "One Cut of the Dead" 2017 97))
(define show2 (make-sitcom "Rick and Morty" 3 5))
(define show3 (make-movie "Welt am Draht" 1973 205))
(define show4 (make-sitcom "Futurama" 4 15))

; Exercise 1.

; process-show: Show -> ...
; ...
(define (process-show s)
  (cond [(movie? s)
         (... (movie-title s) ...
              (movie-year s) ...
              (movie-minutes s) ...)]
        [(sitcom? s)
         (... (sitcom-series s) ...
              (sitcom-season s) ...
              (sitcom-episode s) ...)]))

; Exercise 2.

; show-minutes: Show -> Number
; Calculates the runtime of a show in minutes.
(define (show-minutes s)
  (cond [(movie? s) (movie-minutes s)]
        [(sitcom? s) 20]))

(check-expect (show-minutes show1) 97)
(check-expect (show-minutes show2) 20)
(check-expect (show-minutes show3) 205)
(check-expect (show-minutes show4) 20)

; Exercise 3.

; show-name: Show -> String
; Produces a typical title for a show.
(define (show-name s)
  (cond [(movie? s) (string-append (movie-title s) " (" (number->string (movie-year s)) ")")]
        [(sitcom? s) (string-append (sitcom-series s) " S"
                                    (number->string (sitcom-season s)) "E"
                                    (number->string (sitcom-episode s)))]))

(check-expect (show-name show1) "One Cut of the Dead (2017)")
(check-expect (show-name show2) "Rick and Morty S3E5")
(check-expect (show-name show3) "Welt am Draht (1973)")
(check-expect (show-name show4) "Futurama S4E15")

; Exercise 4.

; A Mobile is one of:
; - (make-leaf Number)
; - (make-rod Mobile Number Number Mobile)
(define-struct leaf [weight])
(define-struct rod [lm ld rd rm])

(define leaf1 (make-leaf 10))
(define leaf2 (make-leaf 21))
(define rod1 (make-rod leaf1 1 2 leaf2))
(define rod2 (make-rod rod1 22 12 leaf2))
(define rod3 (make-rod leaf1 1 1 leaf1))
(define rod4 (make-rod rod2 1 1 rod2))
(define rod1-lightened (make-rod (make-leaf 5) 1 2 (make-leaf 10.5)))
(define rod2-lightened (make-rod rod1-lightened 22 12 (make-leaf 10.5)))
(define enlarged-rod1-2-times (make-rod leaf1 2 4 leaf2))
(define enlarged-rod2-3-times
  (make-rod (make-rod leaf1 3 6 leaf2)
            66 36
            leaf2))

; process-mobile: Mobile -> ...
; ...
(define (process-mobile m)
  (cond [(leaf? m) (... (leaf-weight m) ...)]
        [(rod? m) (... (process-mobile (rod-lm m)) ...
                       (rod-ld m) ...
                       (rod-rd m) ...
                       (process-mobile (rod-rm m)) ...)]))

; Exercise 5.

; weight: Mobile -> Number
; Calculates the weight of a mobile.
(define (weight m)
  (cond [(leaf? m) (leaf-weight m)]
        [(rod? m) (+ (weight (rod-lm m))
                     (weight (rod-rm m)))]))

(check-expect (weight leaf1) 10)
(check-expect (weight leaf2) 21)
(check-expect (weight rod1) 31)
(check-expect (weight rod2) 52)

; Exercise 6

; average-leaf-weight: Mobile -> Number
; Calculates the average weights of a mobile's leaves.
(define (average-leaf-weight m)
  (cond [(leaf? m) (leaf-weight m)]
        [(rod? m) (/ (+ (weight (rod-lm m)) (weight (rod-rm m)))
                     (+ (leaf-count (rod-lm m)) (leaf-count (rod-rm m))))]))

(check-expect (average-leaf-weight leaf1) 10)
(check-expect (average-leaf-weight leaf2) 21)
(check-expect (average-leaf-weight rod1) 15.5)
(check-expect (average-leaf-weight rod2) (/ 52 3))

; leaf-count: Mobile -> Number
; Counts the leaves in a mobile.
(define (leaf-count m)
  (cond [(leaf? m) 1]
        [(rod? m) (+ (leaf-count (rod-lm m)) (leaf-count (rod-rm m)))]))

(check-expect (leaf-count leaf1) 1)
(check-expect (leaf-count leaf2) 1)
(check-expect (leaf-count rod1) 2)
(check-expect (leaf-count rod2) 3)

; Exercise 7

; balanced?: Mobile -> Boolean
; Determines whether the given mobile is balanced at the top.
(define (balanced? m)
  (cond [(leaf? m) true]
        [(rod? m) (= (* (rod-ld m) (weight (rod-lm m)))
                     (* (rod-rd m) (weight (rod-rm m))))]))

(check-expect (balanced? leaf1) true)
(check-expect (balanced? leaf2) true)
(check-expect (balanced? rod1) false)
(check-expect (balanced? rod2) false)
(check-expect (balanced? rod3) true)
(check-expect (balanced? rod4) true)

; all-balanced?: Mobile -> Boolean
; Determines whether the given mobile is balanced at all levels.
(define (all-balanced? m)
  (cond [(leaf? m) true]
        [(rod? m) (and (balanced? m)
                       (balanced? (rod-lm m))
                       (balanced? (rod-rm m)))]))

(check-expect (all-balanced? leaf1) true)
(check-expect (all-balanced? leaf2) true)
(check-expect (all-balanced? rod1) false)
(check-expect (all-balanced? rod2) false)
(check-expect (all-balanced? rod3) true)
(check-expect (all-balanced? rod4) false)




; Exercise 8

; lighten: Mobile -> Mobile
; Lightens a mobile by half.
(define (lighten m)
  (cond [(leaf? m) (make-leaf (/ (leaf-weight m) 2))]
        [(rod? m) (make-rod (lighten (rod-lm m))
                            (rod-ld m)
                            (rod-rd m)
                            (lighten (rod-rm m)))]))

; Actual value (make-rod (make-leaf 5) 1 2 (make-leaf 10.5)) differs from
;              (make-rod (make-leaf 5) 1 2 (make-leaf 10.5)), the expected value.
(check-expect (lighten rod1) rod1-lightened)
(check-expect (lighten rod2) rod2-lightened)


; Exercise 9

; enlarge: Mobile Number -> Mobile
; Multiplies a mobile's rod distances by the given number.
(define (enlarge m n)
  (cond [(leaf? m) m]
        [(rod? m) (make-rod (enlarge (rod-lm m) n)
                            (* (rod-ld m) n)
                            (* (rod-rd m) n)
                            (enlarge (rod-rm m) n))]))


(check-expect (enlarge rod1 2) enlarged-rod1-2-times)
(check-expect (enlarge rod2 3) enlarged-rod2-3-times)

; Exercise 10

; A PositiveInteger is one of:
; - 1
; - (+ PositiveInteger 1)

; all-balanced-mobile : PositiveInteger -> Mobile
; Creates a balanced mobile that has the requested amount of leaves and is balanced.
(define (all-balanced-mobile n)
  (cond [(= n 1) (make-leaf 1)]
        [else (counterbalance (all-balanced-mobile (- n 1)))]))

(check-expect (all-balanced? (all-balanced-mobile 1)) true)
(check-expect (all-balanced? (all-balanced-mobile 2)) true)
(check-expect (all-balanced? (all-balanced-mobile 3)) true)
(check-expect (all-balanced? (all-balanced-mobile 4)) true)
(check-expect (all-balanced? (all-balanced-mobile 5)) true)
(check-expect (all-balanced? (all-balanced-mobile 6)) true)
(check-expect (all-balanced? (all-balanced-mobile 7)) true)
(check-expect (all-balanced? (all-balanced-mobile 8)) true)
(check-expect (all-balanced? (all-balanced-mobile 9)) true)
(check-expect (all-balanced? (all-balanced-mobile 10)) true)
(check-expect (all-balanced? (all-balanced-mobile 11)) true)


; counterbalance : Mobile -> Mobile
; adds a leaf to a given mobile in a balanced? way
(define (counterbalance m)
  (make-rod m 20 20 (make-leaf (weight m))))

(check-expect (counterbalance leaf1)
              (make-rod leaf1 20 20 leaf1))
(check-expect (all-balanced? (counterbalance leaf1)) true)
(check-expect (counterbalance rod3)
              (make-rod rod3 20 20 (make-leaf (weight rod3))))
(check-expect (all-balanced? (counterbalance rod3)) true)
`,
`Defined movie to be a structure type named movie.
Defined sitcom to be a structure type named sitcom.
Defined show1 to be (make-movie "One Cut of the Dead" 2017 97).
Defined show2 to be (make-sitcom "Rick and Morty" 3 5).
Defined show3 to be (make-movie "Welt am Draht" 1973 205).
Defined show4 to be (make-sitcom "Futurama" 4 15).
Defined (process-show s) to be (cond [(movie? s) (... (movie-title s) ... (movie-year s) ... (movie-minutes s) ...)] [(sitcom? s) (... (sitcom-series s) ... (sitcom-season s) ... (sitcom-episode s) ...)]).
Defined (show-minutes s) to be (cond [(movie? s) (movie-minutes s)] [(sitcom? s) 20]).
🎉
🎉
🎉
🎉
Defined (show-name s) to be (cond [(movie? s) (string-append (movie-title s) " (" (number->string (movie-year s)) ")")] [(sitcom? s) (string-append (sitcom-series s) " S" (number->string (sitcom-season s)) "E" (number->string (sitcom-episode s)))]).
🎉
🎉
🎉
🎉
Defined leaf to be a structure type named leaf.
Defined rod to be a structure type named rod.
Defined leaf1 to be (make-leaf 10).
Defined leaf2 to be (make-leaf 21).
Defined rod1 to be (make-rod (make-leaf 10) 1 2 (make-leaf 21)).
Defined rod2 to be (make-rod (make-rod (make-leaf 10) 1 2 (make-leaf 21)) 22 12 (make-leaf 21)).
Defined rod3 to be (make-rod (make-leaf 10) 1 1 (make-leaf 10)).
Defined rod4 to be (make-rod (make-rod (make-rod (make-leaf 10) 1 2 (make-leaf 21)) 22 12 (make-leaf 21)) 1 1 (make-rod (make-rod (make-leaf 10) 1 2 (make-leaf 21)) 22 12 (make-leaf 21))).
Defined rod1-lightened to be (make-rod (make-leaf 5) 1 2 (make-leaf 10.5)).
Defined rod2-lightened to be (make-rod (make-rod (make-leaf 5) 1 2 (make-leaf 10.5)) 22 12 (make-leaf 10.5)).
Defined enlarged-rod1-2-times to be (make-rod (make-leaf 10) 2 4 (make-leaf 21)).
Defined enlarged-rod2-3-times to be (make-rod (make-rod (make-leaf 10) 3 6 (make-leaf 21)) 66 36 (make-leaf 21)).
Defined (process-mobile m) to be (cond [(leaf? m) (... (leaf-weight m) ...)] [(rod? m) (... (process-mobile (rod-lm m)) ... (rod-ld m) ... (rod-rd m) ... (process-mobile (rod-rm m)) ...)]).
Defined (weight m) to be (cond [(leaf? m) (leaf-weight m)] [(rod? m) (+ (weight (rod-lm m)) (weight (rod-rm m)))]).
🎉
🎉
🎉
🎉
Defined (average-leaf-weight m) to be (cond [(leaf? m) (leaf-weight m)] [(rod? m) (/ (+ (weight (rod-lm m)) (weight (rod-rm m))) (+ (leaf-count (rod-lm m)) (leaf-count (rod-rm m))))]).
🎉
🎉
🎉
🎉
Defined (leaf-count m) to be (cond [(leaf? m) 1] [(rod? m) (+ (leaf-count (rod-lm m)) (leaf-count (rod-rm m)))]).
🎉
🎉
🎉
🎉
Defined (balanced? m) to be (cond [(leaf? m) true] [(rod? m) (= (* (rod-ld m) (weight (rod-lm m))) (* (rod-rd m) (weight (rod-rm m))))]).
🎉
🎉
🎉
🎉
🎉
🎉
Defined (all-balanced? m) to be (cond [(leaf? m) true] [(rod? m) (and  (balanced? m) (balanced? (rod-lm m)) (balanced? (rod-rm m)))]).
🎉
🎉
🎉
🎉
🎉
🎉
Defined (lighten m) to be (cond [(leaf? m) (make-leaf (/ (leaf-weight m) 2))] [(rod? m) (make-rod (lighten (rod-lm m)) (rod-ld m) (rod-rd m) (lighten (rod-rm m)))]).
🎉
🎉
Defined (enlarge m n) to be (cond [(leaf? m) m] [(rod? m) (make-rod (enlarge (rod-lm m) n) (* (rod-ld m) n) (* (rod-rd m) n) (enlarge (rod-rm m) n))]).
🎉
🎉
Defined (all-balanced-mobile n) to be (cond [(= n 1) (make-leaf 1)] [else (counterbalance (all-balanced-mobile (- n 1)))]).
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
Defined (counterbalance m) to be (make-rod m 20 20 (make-leaf (weight m))).
🎉
🎉
🎉
🎉
`);

}