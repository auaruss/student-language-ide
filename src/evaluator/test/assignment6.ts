/**
 * @fileoverview A6 from C211 at IU made into tests for our evaluator.
 * 
 * @author Alice Russell
 */

 'use strict';

 import { tIO } from './test-harness';
 
 export const a6Tests = (): void => {
 
tIO(`; A Show is one of:
; - (make-movie String Number Number)
; - (make-sitcom String Number Number)
(define-struct movie (title year minutes))
(define-struct sitcom (series season episode))


(define show1 (make-movie "One Cut of the Dead" 2017 97))
(define show2 (make-sitcom "Rick and Morty" 2 6))
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
; Computes how many minutes a given Show lasts.
(define (show-minutes s)
  (cond [(movie? s)
         (movie-minutes s)]
        [(sitcom? s)
         (* 20 (sitcom-season s) (sitcom-episode s))]))

(check-expect (show-minutes show1) 97)
(check-expect (show-minutes show2) (* 20 6 2))
(check-expect (show-minutes show3) 205)
(check-expect (show-minutes show4) (* 20 4 15))

; Exercise 3.

; show-name: Show -> String
; Produces a string that names a given Show.
(define (show-name s)
  (cond [(movie? s) (movie-title s)]
        [(sitcom? s) (sitcom-series s)]))

(check-expect (show-name show1) "One Cut of the Dead")
(check-expect (show-name show2) "Rick and Morty")
(check-expect (show-name show3) "Welt am Draht")
(check-expect (show-name show4) "Futurama")

; Exercise 4.

; A Job is one of:
; - (make-entry Number)
; - (make-promotion Number Job)

(define-struct entry (salary))
(define-struct promotion (raise old-job))

; Exercise 5.

(define job1 (make-entry 15000))
(define job2 (make-promotion 2500 job1))
(define job3 (make-promotion 3000 job2))
(define job4 (make-promotion -25 job3))

; Exercise 6.

; process-job: Job -> ...
; ...
(define (process-job j)
  (cond [(entry? j) (... (entry-salary j) ...)]
        [(promotion? j)
         (... (promotion-raise j) ...
              (process-job (promotion-old-job j)) ...)]))

; Exercise 7.

; salary: Job -> Number
; Accepts a Job and returns its salary, which is the initial salary of the entry plus all the raises of the promotions.
(define (salary j)
  (cond [(entry? j) (entry-salary j)]
        [(promotion? j) (+ (promotion-raise j)
                           (salary (promotion-old-job j)))]))

(check-expect (salary job1) 15000)
(check-expect (salary job2) 17500)
(check-expect (salary job3) 20500)
(check-expect (salary job4) 20475)

; Exercise 8.

; pay-cut?: Job -> Boolean
; Accepts a Job and determines whether it contains a negative raise at any point in time.
(define (pay-cut? j)
  (cond [(entry? j) false]
        [(promotion? j)
         (or (< (promotion-raise j) 0)
             (pay-cut? (promotion-old-job j)))]))

(check-expect (pay-cut? job1) false)
(check-expect (pay-cut? job2) false)
(check-expect (pay-cut? job3) false)
(check-expect (pay-cut? job4) true)

; Exercise 9.

; promote: Job Number -> Job
; Takes a Job and a raise amount, and returns the new Job that someone with the given Job would have after getting the given promotion.
(define (promote j r)
  (make-promotion r j))

(check-expect (promote job1 2500) job2)
(check-expect (promote job2 3000) job3)
(check-expect (promote job3 -25) job4)

; Exercise 10.

; drawing exercise omitted

; Exercise 11.

; A Mobile is one of:
; - (make-leaf Number)
; - (make-rod Mobile Number Number Mobile)
(define-struct leaf [weight])
(define-struct rod [lm ld rd rm])

(define mobile1 (make-leaf 12))
(define mobile2 (make-rod (make-leaf 24) 23 32 mobile1))
(define mobile3 (make-rod mobile1 10 10 mobile1))

; Exercise 12.

; weight: Mobile -> Number
; Takes a Mobile as input and computes its total weight.
(define (weight m)
  (cond [(leaf? m) (leaf-weight m)]
        [(rod? m) (+ (weight (rod-lm m))
                     (weight (rod-rm m)))]))

(check-expect (weight mobile1) 12)
(check-expect (weight mobile2) 36)
(check-expect (weight mobile3) 24)

; Exercise 13.

; average-leaf-weight: Mobile -> Number
; Takes a Mobile as input and computes its leaves’ average weight.
(define (average-leaf-weight m)
  (/ (weight m) (leaf-count m)))

(check-expect (average-leaf-weight mobile1) 12)
(check-expect (average-leaf-weight mobile2) 18)
(check-expect (average-leaf-weight mobile3) 12)

; leaf-count: Mobile -> Number
; Takes a Mobile as input and computes its number of leaves.
(define (leaf-count m)
  (cond [(leaf? m) 1]
        [(rod? m) (+ (leaf-count (rod-lm m))
                     (leaf-count (rod-rm m)))]))

(check-expect (leaf-count mobile1) 1)
(check-expect (leaf-count mobile2) 2)
(check-expect (leaf-count mobile3) 2)

; Exercise 14.

; all-balanced?: Mobile -> Boolean
; Takes a Mobile as input and returns a Boolean indicating whether it is balanced everywhere.
(define (all-balanced? m)
  (if (leaf? m)
      true
      (and (balanced? m) (balanced? (rod-lm m)) (balanced? (rod-rm m)))))

(check-expect (all-balanced? mobile1) true)
(check-expect (all-balanced? mobile2) false)
(check-expect (all-balanced? mobile3) true)

; balanced? : Mobile -> Boolean
; determines whether the given mobile is balanced at the top
(define (balanced? m)
  (cond [(leaf? m) true]
        [(rod? m) (= (* (rod-ld m) (weight (rod-lm m)))
                     (* (rod-rd m) (weight (rod-rm m))))]))

(check-expect (balanced? mobile1) true)
(check-expect (balanced? mobile2) false)
(check-expect (balanced? mobile3) true)

; Exercise 15.

; lighten: Mobile -> Mobile
; Takes a Mobile as input and returns a new Mobile that is like the given one except everything weighs half as much as the given one.
(define (lighten m)
  (if (leaf? m)
      (make-leaf (/ (leaf-weight m) 2))
      (make-rod (lighten (rod-lm m)) (rod-ld m) (rod-rd m) (lighten (rod-rm m)))))

(check-expect (lighten mobile1) (make-leaf 6))
(check-expect (lighten mobile2) (make-rod (make-leaf 12) 23 32 (make-leaf 6)))
(check-expect (lighten mobile3) (make-rod (make-leaf 6) 10 10 (make-leaf 6)))

; Exercise 16.

; enlarge: Number Mobile -> Mobile
; Takes a Number and Mobile as inputs and returns a new Mobile that is like the given one except all the distances are that many times as long as the given one.
(define (enlarge n m)
  (if (leaf? m) m
      (make-rod (rod-lm m)
                (* n (rod-ld m))
                (* n (rod-rd m))
                (rod-rm m))))

(check-expect (enlarge 2 mobile1) mobile1)
(check-expect (enlarge 4 mobile2) (make-rod (make-leaf 24) (* 23 4) (* 32 4) mobile1))
(check-expect (enlarge 6 mobile3) (make-rod mobile1 60 60 mobile1))

; Exercise 17.

; A PositiveInteger is one of:
; - 1
; - (+ PositiveInteger 1)

; all-balanced-mobile: PositiveInteger -> Mobile
; Takes a positive integer as input and returns a Mobile that has exactly that many leaves and satisfies all-balanced?.
(define (all-balanced-mobile n)
  (if (= n 1) (make-leaf 1) (counterbalance (all-balanced-mobile (- n 1)))))

(check-expect true (and (balanced? (all-balanced-mobile 1)) (= (leaf-count (all-balanced-mobile 1)) 1)))
(check-expect true (and (balanced? (all-balanced-mobile 2)) (= (leaf-count (all-balanced-mobile 2)) 2)))
(check-expect true (and (balanced? (all-balanced-mobile 3)) (= (leaf-count (all-balanced-mobile 3)) 3)))
(check-expect true (and (balanced? (all-balanced-mobile 4)) (= (leaf-count (all-balanced-mobile 4)) 4)))
(check-expect true (and (balanced? (all-balanced-mobile 5)) (= (leaf-count (all-balanced-mobile 5)) 5)))
(check-expect true (and (balanced? (all-balanced-mobile 6)) (= (leaf-count (all-balanced-mobile 6)) 6)))
(check-expect true (and (balanced? (all-balanced-mobile 7)) (= (leaf-count (all-balanced-mobile 7)) 7)))
(check-expect true (and (balanced? (all-balanced-mobile 8)) (= (leaf-count (all-balanced-mobile 8)) 8)))
(check-expect true (and (balanced? (all-balanced-mobile 9)) (= (leaf-count (all-balanced-mobile 9)) 9)))
(check-expect true (and (balanced? (all-balanced-mobile 10)) (= (leaf-count (all-balanced-mobile 10)) 10)))

; counterbalance : Mobile -> Mobile
; adds a leaf to a given mobile in a balanced? way
(define (counterbalance m)
  (make-rod m 20 20 (make-leaf (weight m))))

(check-expect true (balanced? (counterbalance mobile1)))
(check-expect true (balanced? (counterbalance mobile2)))
(check-expect true (balanced? (counterbalance mobile3)))
`,
`Defined movie to be a structure type named movie.
Defined sitcom to be a structure type named sitcom.
Defined show1 to be (make-movie "One Cut of the Dead" 2017 97).
Defined show2 to be (make-sitcom "Rick and Morty" 2 6).
Defined show3 to be (make-movie "Welt am Draht" 1973 205).
Defined show4 to be (make-sitcom "Futurama" 4 15).
Defined (process-show s) to be (cond [(movie? s) (... (movie-title s) ... (movie-year s) ... (movie-minutes s) ...)] [(sitcom? s) (... (sitcom-series s) ... (sitcom-season s) ... (sitcom-episode s) ...)]).
Defined (show-minutes s) to be (cond [(movie? s) (movie-minutes s)] [(sitcom? s) (* 20 (sitcom-season s) (sitcom-episode s))]).
🎉
🎉
🎉
🎉
Defined (show-name s) to be (cond [(movie? s) (movie-title s)] [(sitcom? s) (sitcom-series s)]).
🎉
🎉
🎉
🎉
Defined entry to be a structure type named entry.
Defined promotion to be a structure type named promotion.
Defined job1 to be (make-entry 15000).
Defined job2 to be (make-promotion 2500 (make-entry 15000)).
Defined job3 to be (make-promotion 3000 (make-promotion 2500 (make-entry 15000))).
Defined job4 to be (make-promotion -25 (make-promotion 3000 (make-promotion 2500 (make-entry 15000)))).
Defined (process-job j) to be (cond [(entry? j) (... (entry-salary j) ...)] [(promotion? j) (... (promotion-raise j) ... (process-job (promotion-old-job j)) ...)]).
Defined (salary j) to be (cond [(entry? j) (entry-salary j)] [(promotion? j) (+ (promotion-raise j) (salary (promotion-old-job j)))]).
🎉
🎉
🎉
🎉
Defined (pay-cut? j) to be (cond [(entry? j) false] [(promotion? j) (or  (< (promotion-raise j) 0) (pay-cut? (promotion-old-job j)))]).
🎉
🎉
🎉
🎉
Defined (promote j r) to be (make-promotion r j).
🎉
🎉
🎉
Defined leaf to be a structure type named leaf.
Defined rod to be a structure type named rod.
Defined mobile1 to be (make-leaf 12).
Defined mobile2 to be (make-rod (make-leaf 24) 23 32 (make-leaf 12)).
Defined mobile3 to be (make-rod (make-leaf 12) 10 10 (make-leaf 12)).
Defined (weight m) to be (cond [(leaf? m) (leaf-weight m)] [(rod? m) (+ (weight (rod-lm m)) (weight (rod-rm m)))]).
🎉
🎉
🎉
Defined (average-leaf-weight m) to be (/ (weight m) (leaf-count m)).
🎉
🎉
🎉
Defined (leaf-count m) to be (cond [(leaf? m) 1] [(rod? m) (+ (leaf-count (rod-lm m)) (leaf-count (rod-rm m)))]).
🎉
🎉
🎉
Defined (all-balanced? m) to be (if (leaf? m) true (and  (balanced? m) (balanced? (rod-lm m)) (balanced? (rod-rm m)))).
🎉
🎉
🎉
Defined (balanced? m) to be (cond [(leaf? m) true] [(rod? m) (= (* (rod-ld m) (weight (rod-lm m))) (* (rod-rd m) (weight (rod-rm m))))]).
🎉
🎉
🎉
Defined (lighten m) to be (if (leaf? m) (make-leaf (/ (leaf-weight m) 2)) (make-rod (lighten (rod-lm m)) (rod-ld m) (rod-rd m) (lighten (rod-rm m)))).
🎉
🎉
🎉
Defined (enlarge n m) to be (if (leaf? m) m (make-rod (rod-lm m) (* n (rod-ld m)) (* n (rod-rd m)) (rod-rm m))).
🎉
🎉
🎉
Defined (all-balanced-mobile n) to be (if (= n 1) (make-leaf 1) (counterbalance (all-balanced-mobile (- n 1)))).
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
`
);

}
