#!/bin/sh -

# Questo script serve per ricreare/aggiornare una copia locale del branch supermerge
# NOTA: non tutti i pull possono essere "puliti"
# Vanno risolti un paio di conflitti che possono riguardare file comuni aggiornati
# contemporaneamente dai vari moduli, in pratica sono .pre-commit-config.yaml e
# requirements.txt. Una volta risolti i conflitti potete rilanciare lo script.

function rebase_n_merge()
{
	repo="$1"; shift
	rbranch="$1"; shift
	lbranch="$1"; shift
	git fetch "$repo" "+${rbranch}:${lbranch}"
	git rebase "$@" 14.0-supermerge "${lbranch}"
	git checkout 14.0-supermerge
	git merge --no-edit --no-ff "${lbranch}"
}

function rebase_n_merge_pr()
{
	pr="$1"; shift
	rebase_n_merge https://github.com/OCA/l10n-italy "pull/${pr}/head" "pr-${pr}" "$@"
}

# clone iniziale
if [ ! -x l10n-italy -a ! -x .git ]; then
	git clone --single-branch --branch 14.0 https://github.com/OCA/l10n-italy 
	(cd l10n-italy; git checkout -b 14.0-supermerge)
fi
[ -x l10n-italy ] && cd l10n-italy

set -xe
rebase_n_merge https://github.com/odoo-italia/l10n-italy 14.0-premerge 14.0-premerge
# fixes
# rebase_n_merge_pr 2285
rebase_n_merge_pr 2327
rebase_n_merge_pr 2346
rebase_n_merge_pr 2425
rebase_n_merge_pr 2430
rebase_n_merge_pr 2453
rebase_n_merge_pr 2468
rebase_n_merge_pr 2476
rebase_n_merge_pr 2479
# porting
rebase_n_merge_pr 2310
rebase_n_merge_pr 2138
rebase_n_merge_pr 2139
rebase_n_merge_pr 2149
rebase_n_merge_pr 2151
rebase_n_merge_pr 2157
rebase_n_merge_pr 2198
rebase_n_merge_pr 2202
rebase_n_merge_pr 2212
rebase_n_merge_pr 2228
rebase_n_merge_pr 2229
rebase_n_merge_pr 2258
rebase_n_merge_pr 2259
rebase_n_merge_pr 2315
rebase_n_merge https://github.com/OmniaGit/l10n-italy 14.0-mig-l10n_it_location_nuts 14.0-mig-l10n_it_location_nuts
rebase_n_merge_pr 2386
rebase_n_merge_pr 2438
